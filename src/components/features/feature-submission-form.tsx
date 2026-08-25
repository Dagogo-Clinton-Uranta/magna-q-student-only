"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { submitFeatureRequest } from "@/app/get-featured/actions";
import { createClient } from "@/lib/supabase/client";

type Draft = {
  title: string;
  summary: string;
  representativeQuote: string;
  imageAltText: string;
  imagePath: string;
  imageUrl: string;
  imageStorageProvider: "supabase" | "s3";
};

const emptyDraft: Draft = {
  title: "",
  summary: "",
  representativeQuote: "",
  imageAltText: "",
  imagePath: "",
  imageUrl: "",
  imageStorageProvider: "supabase",
};

export function FeatureSubmissionForm({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const storageKey = `magnaq:feature-request-draft:v1:${userId}`;
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setDraft({ ...emptyDraft, ...(JSON.parse(saved) as Draft) });
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, hydrated, storageKey]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setNotice(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice({ ok: false, text: "Use a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ ok: false, text: "The image must be 5 MB or smaller." });
      return;
    }
    setUploading(true);
    try {
      const presignResponse = await fetch("/api/features/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
      });
      const presign = (await presignResponse.json()) as {
        uploadUrl?: string;
        publicUrl?: string;
        path?: string;
        storageProvider?: "s3";
        code?: string;
        error?: string;
      };
      if (
        presignResponse.ok &&
        presign.uploadUrl &&
        presign.publicUrl &&
        presign.path
      ) {
        const uploadResponse = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadResponse.ok)
          throw new Error(`S3 rejected the upload (${uploadResponse.status}).`);
        setDraft((current) => ({
          ...current,
          imagePath: presign.path!,
          imageUrl: presign.publicUrl!,
          imageStorageProvider: "s3",
          imageAltText:
            current.imageAltText ||
            file.name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
        }));
        return;
      }
      if (presign.code !== "FEATURE_S3_NOT_CONFIGURED")
        throw new Error(presign.error || "Could not prepare the S3 upload.");

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("feature-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("feature-images")
        .getPublicUrl(path);
      setDraft((current) => ({
        ...current,
        imagePath: path,
        imageUrl: data.publicUrl,
        imageStorageProvider: "supabase",
        imageAltText:
          current.imageAltText ||
          file.name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
      }));
    } catch (error) {
      console.error("Could not upload feature image.", error);
      setNotice({
        ok: false,
        text: "We could not upload that image right now.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!draft.imageUrl || !draft.imagePath) {
      setNotice({ ok: false, text: "Please upload a project image." });
      return;
    }
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("imageUrl", draft.imageUrl);
    formData.set("imagePath", draft.imagePath);
    formData.set("imageStorageProvider", draft.imageStorageProvider);
    const result = await submitFeatureRequest(formData);
    setSubmitting(false);
    setNotice({ ok: result.ok, text: result.message });
    if (result.ok) {
      setDraft(emptyDraft);
      window.localStorage.removeItem(storageKey);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadImage(event.dataTransfer.files[0]);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-body">
          Project title
          <input
            name="title"
            required
            minLength={5}
            maxLength={160}
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
            className="input mt-2 w-full"
            placeholder="What are you building or researching?"
          />
        </label>
        <label className="block text-sm font-semibold text-body">
          Magna-Q username
          <input
            name="username"
            value={username}
            readOnly
            className="input mt-2 w-full bg-soft text-muted"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold text-body">
        Tell us what you are working on
        <textarea
          name="summary"
          required
          minLength={40}
          maxLength={5000}
          rows={7}
          value={draft.summary}
          onChange={(event) => update("summary", event.target.value)}
          className="input mt-2 w-full resize-y py-3"
          placeholder="Share the problem, your approach, who it helps, progress so far, and the support or collaborators you hope to find."
        />
      </label>
      <label className="block text-sm font-semibold text-body">
        The quote or message that should represent you
        <textarea
          name="representativeQuote"
          required
          minLength={5}
          maxLength={500}
          rows={3}
          value={draft.representativeQuote}
          onChange={(event) =>
            update("representativeQuote", event.target.value)
          }
          className="input mt-2 w-full resize-y py-3"
          placeholder="A sentence readers should remember."
        />
      </label>
      <div>
        <p className="text-sm font-semibold text-body">Project image</p>
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-2 border-2 border-dashed p-6 text-center transition ${dragging ? "border-brand-500 bg-soft" : "border-line bg-canvas"}`}
        >
          {draft.imageUrl ? (
            <div className="mx-auto max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.imageUrl}
                alt="Uploaded feature preview"
                className="mx-auto max-h-64 w-full object-cover"
              />
              <button
                type="button"
                className="button-secondary mt-4"
                onClick={() => fileInput.current?.click()}
              >
                Replace image
              </button>
            </div>
          ) : (
            <>
              <p className="font-semibold text-ink">
                {uploading
                  ? "Uploading image…"
                  : "Drag an image here, or choose a file"}
              </p>
              <p className="mt-1 text-sm text-muted">
                JPEG, PNG or WebP · up to 5 MB
              </p>
              <button
                type="button"
                className="button-secondary mt-4"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                Choose image
              </button>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              void uploadImage(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </div>
      <label className="block text-sm font-semibold text-body">
        Describe the image for readers using screen readers
        <input
          name="imageAltText"
          required
          minLength={5}
          maxLength={240}
          value={draft.imageAltText}
          onChange={(event) => update("imageAltText", event.target.value)}
          className="input mt-2 w-full"
          placeholder="For example: Two medical students reviewing a research poster"
        />
      </label>
      <p className="text-sm leading-6 text-muted">
        Your draft is saved in this browser while you move around Magna-Q.
        Submissions are reviewed by our administrators before they can appear
        publicly.
      </p>
      {notice && (
        <div
          role="status"
          className={`px-4 py-3 text-sm font-semibold ${notice.ok ? "bg-emerald-600 text-white" : "bg-red-50 text-red-800"}`}
        >
          {notice.text}
        </div>
      )}
      <button
        type="submit"
        className="button-primary"
        disabled={submitting || uploading}
      >
        {submitting ? "Sending request…" : "Submit for review"}
      </button>
    </form>
  );
}
