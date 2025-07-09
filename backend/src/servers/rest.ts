import { fileTypeFromBlob } from "file-type";
import sharp from "sharp";
import pMap from "p-map";
import convert from "heic-convert";
import crypto from "node:crypto";

import type {
  Session,
  SuspendedToken,
  User,
  EventMembership,
} from "@/generated/prisma";

import lib_logger from "@/modules/logger";
import lib_auth from "@/modules/auth";
import lib_captcha from "@/modules/captcha";
import lib_storage from "@/modules/storage";

import prisma from "@/db/prisma";

import type { BodyInit, ResponseInit } from "undici-types";

export class ClientResponse extends Response {
  constructor(body?: BodyInit, init?: ResponseInit) {
    super(body, init);
    this.headers.set("Access-Control-Allow-Origin", "*");
    this.headers.set("Access-Control-Allow-Methods", "OPTIONS, POST");
    this.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
}

export default class rest {
  private static server: any = null;

  public static async start() {
    const server = Bun.serve({
      port: process.env.REST_PORT,
      routes: {
        "/event/upload-photo": {
          OPTIONS: async (req: Request) => {
            const res = new ClientResponse("Departed");
            return res;
          },

          POST: async (req: Request) => {
            const context = await lib_auth.getContext(req);

            if (!context.authenticated) {
              return ClientResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
              );
            }

            // console.log(context);

            const formData = await req.formData();

            const captchaToken = formData.get("captchaToken");
            const eventId = formData.get("eventId");
            const unprocessedFiles: File[] = formData.getAll("files") as File[];
            const files: {
              ext: string;
              mime: string;
              file: File;
            }[] = [];

            if (!captchaToken) {
              return ClientResponse.json(
                { success: false, error: "Captcha token is required" },
                { status: 400 }
              );
            }

            const captchaValid = await lib_captcha.verify(
              captchaToken as string,
              req.headers.get("CF-Connecting-IP") || ""
            );

            if (!captchaValid) {
              return ClientResponse.json(
                { success: false, error: "Captcha verification failed" },
                { status: 400 }
              );
            }

            if (!eventId) {
              return ClientResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
              );
            }

            if (!unprocessedFiles || unprocessedFiles.length === 0) {
              return ClientResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
              );
            }

            let membershipInfo: EventMembership | null = null;

            try {
              membershipInfo = await prisma.eventMembership.findUnique({
                where: {
                  eventId_userId: {
                    eventId: eventId as string,
                    userId: context.user!.userId,
                  },
                },
              });
            } catch (error) {
              const refId = Bun.randomUUIDv7();

              console.error(
                `${lib_logger.formatPrefix("rest")} [${refId}] Failed to get membership info: ${error}`
              );

              return ClientResponse.json(
                {
                  success: false,
                  error: "Internal server error. refId: ${refId}",
                },
                { status: 500 }
              );
            }

            if (!membershipInfo) {
              console.log("amogus");

              console.log(eventId);
              console.log(context.user!.userId);

              return ClientResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
              );
            }

            let totalSize = 0;

            for (const file of unprocessedFiles) {
              const fileType = await fileTypeFromBlob(file);

              if (!fileType) {
                return ClientResponse.json(
                  { success: false, error: "Invalid file type" },
                  { status: 400 }
                );
              }

              if (!fileType.mime.startsWith("image/")) {
                return ClientResponse.json(
                  { success: false, error: "Invalid file type" },
                  { status: 400 }
                );
              }

              totalSize += file.size;

              files.push({
                ext: fileType.ext,
                mime: fileType.mime,
                file: file,
              });
            }

            if (totalSize > 100 * 1024 * 1024) {
              return ClientResponse.json(
                { success: false, error: "File size too large" },
                { status: 400 }
              );
            }

            const db = `event/${eventId}/photos`;

            const uploadTasks = async (task: {
              ext: string;
              mime: string;
              file: File;
            }) => {
              let fileBuffer = await task.file.arrayBuffer();

              if (
                task.mime.startsWith("image/heic") ||
                task.mime.startsWith("image/heif")
              ) {
                fileBuffer = await convert({
                  buffer: new Uint8Array(fileBuffer),
                  format: "JPEG",
                  quality: 1,
                });
              }

              const { data: buffer, info } = await sharp(
                Buffer.from(fileBuffer)
              )
                .rotate()
                .resize({
                  width: 1600,
                  height: 1600,
                  fit: "inside",
                  withoutEnlargement: true,
                })
                .jpeg({
                  quality: 80,
                  progressive: true,
                  mozjpeg: true,
                })
                .toBuffer({ resolveWithObject: true });

              //Check hash against DB here

              const hash = crypto
                .createHash("sha256")
                .update(new Uint8Array(buffer))
                .digest("hex");

              const existingPhoto = await prisma.eventPhoto.findFirst({
                where: {
                  eventId: eventId as string,
                  hash: hash,
                },
              });

              if (existingPhoto) {
                return {
                  key: existingPhoto.key,
                  width: existingPhoto.width,
                  height: existingPhoto.height,
                  hash: hash,
                };
              }

              const key = await lib_storage.uploadBuffer(db, buffer, {
                name: `${crypto.randomUUID()}.jpeg`,
                mimeType: "image/jpeg",
                size: buffer.length,
              });

              return {
                key,
                width: info.width,
                height: info.height,
                hash: hash,
              };
            };

            const uploaded = await pMap(files, uploadTasks, { concurrency: 5 });

            await prisma.eventPhoto.createMany({
              data: uploaded.map((uploadedFile) => ({
                eventId: eventId as string,

                key: uploadedFile.key,
                width: uploadedFile.width,
                height: uploadedFile.height,
                mimeType: "image/jpeg",
                hash: uploadedFile.hash,

                userId: context.user!.userId,

                memberId: membershipInfo.memberId,
              })),
              // skipDuplicates: true,
            });

            return ClientResponse.json({ success: true });
          },
        },
      },

      error(error) {
        const refId = Bun.randomUUIDv7();

        console.error(
          `${lib_logger.formatPrefix("rest")} [${refId}] Error: ${error.message}`,
          error.stack
        );

        return new Response(`Internal Server Error. refId: ${refId}`, {
          status: 500,
        });
      },
    });

    this.server = server;

    console.log(
      `${lib_logger.formatPrefix("rest")} Running on ${new URL(
        `http://localhost:${process.env.REST_PORT}`
      )}`
    );
  }

  public static async stop() {
    if (this.server) {
      await this.server.stop();

      console.log(`${lib_logger.formatPrefix("rest")} Server stopped.`);
    } else {
      console.log(`${lib_logger.formatPrefix("rest")} No server to stop.`);
    }
  }
}
