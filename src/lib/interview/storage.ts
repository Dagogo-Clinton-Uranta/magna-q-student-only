import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getInterviewStorageConfig() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    region,
    bucket,
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: { accessKeyId, secretAccessKey },
  };
}

export function createInterviewS3Client() {
  const config = getInterviewStorageConfig();
  if (!config) return null;
  return {
    config,
    client: new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
      forcePathStyle: Boolean(config.endpoint),
    }),
  };
}

export async function startMultipartUpload(key: string, contentType: string) {
  const storage = createInterviewS3Client();
  if (!storage) return null;
  const result = await storage.client.send(
    new CreateMultipartUploadCommand({
      Bucket: storage.config.bucket,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      Metadata: { purpose: "residency-interview-practice" },
    }),
  );
  if (!result.UploadId) throw new Error("S3 did not create an upload session.");
  return { uploadId: result.UploadId, bucket: storage.config.bucket };
}

export async function uploadVideoPart({
  key,
  uploadId,
  partNumber,
  body,
}: {
  key: string;
  uploadId: string;
  partNumber: number;
  body: Buffer;
}) {
  const storage = createInterviewS3Client();
  if (!storage) throw new Error("S3 is not configured.");
  const result = await storage.client.send(
    new UploadPartCommand({
      Bucket: storage.config.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
      ContentLength: body.byteLength,
    }),
  );
  if (!result.ETag) throw new Error("S3 did not confirm the uploaded chunk.");
  return result.ETag;
}

export async function completeVideoUpload({
  key,
  uploadId,
  parts,
}: {
  key: string;
  uploadId: string;
  parts: Array<{ ETag: string; PartNumber: number }>;
}) {
  const storage = createInterviewS3Client();
  if (!storage) throw new Error("S3 is not configured.");
  await storage.client.send(
    new CompleteMultipartUploadCommand({
      Bucket: storage.config.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    }),
  );
  return `s3://${storage.config.bucket}/${key}`;
}

export async function getInterviewVideoUrl(key: string) {
  const storage = createInterviewS3Client();
  if (!storage) return null;
  return getSignedUrl(
    storage.client,
    new GetObjectCommand({ Bucket: storage.config.bucket, Key: key }),
    { expiresIn: 300 },
  );
}
