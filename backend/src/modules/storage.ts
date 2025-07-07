import path from "path";
import fs from "fs";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import lib_cache from "@/modules/cache";

// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT_URL,
  S3_BUCKET_NAME,
  S3_CUSTOM_DOMAIN,
} = process.env;

const client = new S3Client({
  region: "auto",
  endpoint: S3_ENDPOINT_URL,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export default class lib_storage {
  public static async saveTempFile(file: File) {
    const tempDir = path.join(__dirname, "..", "..", "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(
      tempDir,
      `${crypto.randomUUID()}.${file.name.split(".").pop()}`
    );

    await fs.promises.writeFile(
      filePath,
      Buffer.from(await file.arrayBuffer())
    );

    return filePath;

    // // try {
    // //   const fileArrayBuffer = await file.arrayBuffer()
    // //   await fs.promises.writeFile(
    // //     path.join(__dirname, file.name),
    // //     Buffer.from(fileArrayBuffer),
    // //   )
    // // } catch (e) {
    // //   return false
    // // }
    // // return true

    // const fileArrayBuffer = await file.arrayBuffer();
    // await fs.promises.writeFile(
    //   path.join(__dirname, file.name),
    //   Buffer.from(fileArrayBuffer)
    // );

    // return true;
  }

  public static async createFolder(db: string): Promise<void> {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: `${db}/`,
      })
    );
  }

  public static async uploadFile(
    db: string,
    file: File,
    meta: {
      name: string;
      mimeType: string;
      size: number;
    }
  ) {
    const key = `${db}/${meta.name}`;

    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: meta.mimeType,
      })
    );

    return key;
  }

  public static async uploadBuffer(
    db: string,
    buffer: Buffer,
    meta: {
      name: string;
      mimeType: string;
      size: number;
    }
  ) {
    const key = `${db}/${meta.name}`;

    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: meta.mimeType,
      })
    );

    return key;
  }

  public static async getFileSignedUrl(key: string, expiresInSeconds = 3600) {
    const cacheKey = `s3-presigned-url:${key}`;

    // Check cache first
    const cached = await lib_cache.get(cacheKey);

    if (cached.data) {
      return cached.data;
    }

    // Generate if not cached
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
    });

    await lib_cache.set(cacheKey, signedUrl, expiresInSeconds - 60);

    return signedUrl;
  }

  public static async batchGetSignedUrls(
    keys: string[],
    expiresInSeconds = 3600
  ) {
    return await Promise.all(
      keys.map(async (key) => ({
        key,
        url: await this.getFileSignedUrl(key, expiresInSeconds),
      }))
    );
  }
}
