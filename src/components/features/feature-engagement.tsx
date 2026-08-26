"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  submitFeatureComment,
  toggleFeaturePulse,
} from "@/app/get-featured/actions";
import { PulseIcon } from "@/components/features/pulse-icon";
import type { FeatureComment } from "@/lib/features/types";

type Suggestion = { username: string; is_featured_member: boolean };
type Notice = {
  ok: boolean;
  text: string;
  kind: "pulse" | "comment";
  id: number;
};

export function FeatureEngagement({
  featureId,
  featuredUsername,
  initialPulseCount,
  initiallyPulsed,
  comments,
}: {
  featureId: string;
  featuredUsername: string;
  initialPulseCount: number;
  initiallyPulsed: boolean;
  comments: FeatureComment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pulsed, setPulsed] = useState(initiallyPulsed);
  const [pulseCount, setPulseCount] = useState(initialPulseCount);
  const [pulseBeat, setPulseBeat] = useState(0);
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice?.ok || notice.kind !== "pulse") return;
    const noticeId = notice.id;
    const timer = window.setTimeout(() => {
      setNotice((current) => (current?.id === noticeId ? null : current));
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function togglePulse() {
    startTransition(async () => {
      const result = await toggleFeaturePulse(featureId);
      setNotice({
        ok: result.ok,
        text: result.message,
        kind: "pulse",
        id: Date.now(),
      });
      if (result.ok) {
        setPulsed(Boolean(result.pulsed));
        setPulseCount(result.count ?? pulseCount);
        setPulseBeat((current) => current + 1);
      }
    });
  }

  async function updateMentions(next: string) {
    setContent(next);
    const match = next.match(/(?:^|\s)@([a-z0-9_]*)$/i);
    if (!match) {
      setSuggestions([]);
      setMentionStart(null);
      return;
    }
    const start = next.lastIndexOf("@");
    setMentionStart(start);
    const response = await fetch(
      `/api/features/mentions?featureId=${encodeURIComponent(featureId)}&q=${encodeURIComponent((match[1] ?? "").toLowerCase())}`,
    );
    if (!response.ok) return;
    const data = (await response.json()) as { suggestions?: Suggestion[] };
    setSuggestions(data.suggestions ?? []);
  }

  function selectMention(username: string) {
    if (mentionStart === null) return;
    setContent(`${content.slice(0, mentionStart)}@${username} `);
    setMentionStart(null);
    setSuggestions([]);
  }

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const formData = new FormData();
    formData.set("featureId", featureId);
    formData.set("content", content);
    startTransition(async () => {
      const result = await submitFeatureComment(formData);
      setNotice({
        ok: result.ok,
        text: result.message,
        kind: "comment",
        id: Date.now(),
      });
      if (result.ok) {
        setContent("");
        setSuggestions([]);
        router.refresh();
      }
    });
  }

  return (
    <section
      className="mt-10 border-t border-line pt-8"
      aria-labelledby="feature-conversation"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Community response</p>
          <h2
            id="feature-conversation"
            className="mt-2 text-2xl font-normal text-ink"
          >
            Give it a pulse or join the conversation
          </h2>
        </div>
        <button
          type="button"
          onClick={togglePulse}
          disabled={pending}
          aria-pressed={pulsed}
          className={`feature-pulse-button inline-flex min-h-12 items-center gap-2.5 border px-5 text-sm font-bold shadow-card transition ${pulsed ? "border-emerald-600 bg-emerald-600 text-white shadow-emerald-900/20" : "border-brand-300 bg-field text-brand-800 hover:border-brand-500 hover:bg-soft"}`}
        >
          <span
            key={pulseBeat}
            className={pulseBeat > 0 ? "feature-pulse-beat" : undefined}
          >
            <PulseIcon className="h-7 w-7" />
          </span>
          {pulseCount} {pulseCount === 1 ? "pulse" : "pulses"}
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        The feature with the most pulses will appear on the website homepage.
      </p>

      {notice && (
        <div
          role="status"
          className={`mt-5 px-4 py-3 text-sm font-semibold ${notice.ok ? "bg-emerald-600 text-white" : "bg-red-50 text-red-800"} ${notice.ok && notice.kind === "pulse" ? "feature-pulse-notice" : ""}`}
        >
          {notice.text}
        </div>
      )}

      <form onSubmit={submitComment} className="relative mt-8">
        <label
          htmlFor="feature-comment"
          className="text-sm font-semibold text-body"
        >
          Comment on this feature
        </label>
        <textarea
          id="feature-comment"
          rows={4}
          minLength={2}
          maxLength={2000}
          required
          value={content}
          onChange={(event) => void updateMentions(event.target.value)}
          className="input mt-2 w-full resize-y py-3"
          placeholder={`Write a response or type @ to tag @${featuredUsername}`}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full max-w-sm overflow-auto border border-line bg-field py-1 shadow-lift">
            {suggestions.map((suggestion) => (
              <li key={suggestion.username}>
                <button
                  type="button"
                  onClick={() => selectMention(suggestion.username)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-soft"
                >
                  <span className="font-semibold text-ink">
                    @{suggestion.username}
                  </span>
                  {suggestion.is_featured_member && (
                    <span className="text-xs uppercase tracking-wider text-brand-700">
                      Featured member
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs leading-5 text-muted">
          Keep the conversation inside Magna-Q. Email addresses, phone numbers,
          external links and profanity are removed by moderation.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="button-primary mt-4"
        >
          {pending ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        <h3 className="text-lg font-semibold text-ink">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </h3>
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="border border-line bg-canvas p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">@{comment.username}</p>
              <time
                className="text-xs text-muted"
                dateTime={comment.created_at}
              >
                {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                  new Date(comment.created_at),
                )}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-body">
              {comment.content}
            </p>
          </article>
        ))}
        {comments.length === 0 && (
          <p className="border border-dashed border-line p-6 text-center text-muted">
            No comments yet. Be the first to encourage or thoughtfully challenge
            this work.
          </p>
        )}
      </div>
    </section>
  );
}
