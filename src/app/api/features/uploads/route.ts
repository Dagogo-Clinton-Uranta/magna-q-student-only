import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/guards";
import {
  createFeatureImageUpload,
  featureImageContentTypes,
  featureImageMaxBytes,
} from "@/lib/features/storage";

const requestSchema = z.object({
  contentType: z.enum(featureImageContentTypes),
  fileSize: z.number().int().positive().max(featureImageMaxBytes),
});

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Use a JPEG, PNG or WebP image no larger than 5 MB." },
      { status: 400 },
    );
  const upload = await createFeatureImageUpload({
    userId: profile.id,
    contentType: parsed.data.contentType,
  });
  if (!upload)
    return NextResponse.json(
      {
        error: "Feature-image S3 storage is not configured.",
        code: "FEATURE_S3_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  return NextResponse.json(upload);
}
