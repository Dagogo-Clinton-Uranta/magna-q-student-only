import "server-only";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@/lib/env";

export const featureImageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const featureImageMaxBytes = 5 * 1024 * 1024;

const extensions: Record<(typeof featureImageContentTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function encodedKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function getFeatureS3Storage() {
  const env = getServerEnv();
  const bucket = env.AWS_FEATURES_S3_BUCKET;
  const region = env.AWS_REGION;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  if (!bucket || !region || !accessKeyId || !secretAccessKey) return null;
  if (env.AWS_S3_ENDPOINT && !env.AWS_FEATURES_S3_PUBLIC_URL) return null;
  const publicBaseUrl = (
    env.AWS_FEATURES_S3_PUBLIC_URL ??
    `https://${bucket}.s3.${region}.amazonaws.com`
  ).replace(/\/$/, "");
  return {
    bucket,
    publicBaseUrl,
    client: new S3Client({
      region,
      endpoint: env.AWS_S3_ENDPOINT,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: Boolean(env.AWS_S3_ENDPOINT),
    }),
  };
}

export async function createFeatureImageUpload({
  userId,
  contentType,
}: {
  userId: string;
  contentType: (typeof featureImageContentTypes)[number];
}) {
  const storage = getFeatureS3Storage();
  if (!storage) return null;
  const key = `feature-requests/${userId}/${randomUUID()}.${extensions[contentType]}`;
  const uploadUrl = await getSignedUrl(
    storage.client,
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 },
  );
  return {
    uploadUrl,
    publicUrl: `${storage.publicBaseUrl}/${encodedKey(key)}`,
    path: key,
    storageProvider: "s3" as const,
  };
}
