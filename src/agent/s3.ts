import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream, promises as fs } from "fs";
import path from "path";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

export async function uploadFolderToS3({
  localFolderPath,
  bucketName,
  s3Prefix = "",
  onProgress,
}: {
  localFolderPath: string;
  bucketName: string;
  s3Prefix?: string;
  onProgress?: (message: string) => void;
}) {
  for await (const filePath of walk(localFolderPath)) {
    const relativePath = path
      .relative(localFolderPath, filePath)
      .replace(/\\/g, "/");
    const key = s3Prefix ? `${s3Prefix}/${relativePath}` : relativePath;

    onProgress?.(`Uploading: ${key}`);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: createReadStream(filePath),
      },
    });

    await upload.done();
  }

  console.log("✅ Folder upload complete");
}
