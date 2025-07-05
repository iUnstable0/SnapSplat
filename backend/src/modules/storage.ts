import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
  public static async createFolder(db: string): Promise<void> {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: `${db}/`,
      })
    );
  }
}
