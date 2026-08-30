import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_TTL_SECONDS = 15 * 60;
const PLAYBACK_URL_TTL_SECONDS = 5 * 60;

export function getInterviewStorageConfig() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) return null;

  return {
    accountId,
    bucket,
    endpoint:
      process.env.CLOUDFLARE_R2_ENDPOINT ??
      `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  };
}

export function createInterviewR2Client() {
  const config = getInterviewStorageConfig();
  if (!config) return null;
  return {
    config,
    client: new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: config.credentials,
    }),
  };
}

export async function createInterviewUploadUrl(
  key: string,
  contentType: string,
) {
  const storage = createInterviewR2Client();
  if (!storage) return null;
  const uploadUrl = await getSignedUrl(
    storage.client,
    new PutObjectCommand({
      Bucket: storage.config.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS },
  );
  return { uploadUrl, bucket: storage.config.bucket };
}

export async function verifyInterviewUpload({
  key,
  expectedBytes,
  expectedContentType,
}: {
  key: string;
  expectedBytes: number;
  expectedContentType: string;
}) {
  const storage = createInterviewR2Client();
  if (!storage) throw new Error("R2_NOT_CONFIGURED");
  const object = await storage.client.send(
    new HeadObjectCommand({ Bucket: storage.config.bucket, Key: key }),
  );
  const actualType = object.ContentType?.split(";", 1)[0] ?? "";
  if (
    object.ContentLength !== expectedBytes ||
    actualType !== expectedContentType.split(";", 1)[0]
  )
    throw new Error("R2_OBJECT_METADATA_MISMATCH");
  return `r2://${storage.config.bucket}/${key}`;
}

export async function getInterviewVideoUrl(key: string) {
  const storage = createInterviewR2Client();
  if (!storage) return null;
  return getSignedUrl(
    storage.client,
    new GetObjectCommand({ Bucket: storage.config.bucket, Key: key }),
    { expiresIn: PLAYBACK_URL_TTL_SECONDS },
  );
}
