"use client";
/* eslint-disable react-hooks/exhaustive-deps -- The countdown intentionally uses the latest render closure without recreating request functions. */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatClock } from "@/lib/time/block-timer";
import { getPageWindow } from "@/lib/pagination";
import { PlayerUtilities } from "@/components/study/player-utilities";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  normalizeHighlights,
  readQuestionHighlights,
  selectedTextHighlight,
  type TextHighlight,
  writeQuestionHighlights,
} from "@/lib/study/question-highlights";

type Option = { id: string; text: string };
type Nav = { position: number; answered: boolean; marked: boolean };
type Question = {
  blockId: string;
  mode: "tutor" | "timed";
  status: string;
  position: number;
  total: number;
  questionId: string;
  stem: string;
  imageUrl?: string | null;
  keyPhrases: string[];
  privateNote?: string;
  marked: boolean;
  selectedOptionId?: string | null;
  answered: boolean;
  questionRemainingSeconds?: number | null;
  options: Option[];
  navigator: Nav[];
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: string;
  educationalObjective?: string;
  highYieldSummary?: string;
  usSystemContextNote?: string | null;
  glossary?: Array<{ term: string; definition: string }>;
  rationales?: Record<string, string>;
  optionStats?: Record<string, number>;
  responseCount?: number;
  peerPctCorrect?: number | null;
};

export function QuestionPlayer({
  initial,
  initialNote,
}: {
  initial: Question;
  initialNote: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [question, setQuestion] = useState(initial);
  const [selected, setSelected] = useState(initial.selectedOptionId ?? "");
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [endTestOpen, setEndTestOpen] = useState(false);
  const [endingTest, setEndingTest] = useState(false);
  const [note, setNote] = useState(initial.privateNote ?? initialNote);
  const [noteStatus, setNoteStatus] = useState("");
  const [struck, setStruck] = useState<string[]>([]);
  const [keyInfoVisible, setKeyInfoVisible] = useState(false);
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [aiText, setAiText] = useState("");
  const [remaining, setRemaining] = useState<number | null>(
    initial.mode === "timed" ? (initial.questionRemainingSeconds ?? 90) : null,
  );
  const viewedAt = useRef(Date.now());
  const completing = useRef(false);
  const expiredPosition = useRef<number | null>(null);
  const stemRef = useRef<HTMLParagraphElement>(null);

  async function load(position: number) {
    if (position < 1 || position > question.total) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/study/blocks/${question.blockId}/question/${position}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as Question & { error?: string };
      if (!response.ok) throw new Error(data.error);
      setQuestion(data);
      setHighlights(readQuestionHighlights(data.questionId, data.stem.length));
      setSelected(data.selectedOptionId ?? "");
      setNote(data.privateNote ?? "");
      setNoteStatus("");
      setStruck([]);
      setKeyInfoVisible(false);
      setAiOpen(false);
      setAiStatus("idle");
      setAiText("");
      setRemaining(
        data.mode === "timed" ? (data.questionRemainingSeconds ?? 90) : null,
      );
      expiredPosition.current = null;
      viewedAt.current = Date.now();
    } catch {
      setError(
        "Question could not be loaded. Check your connection and retry.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(optionId = selected) {
    if (!optionId || question.answered) return false;
    setLoading(true);
    setSubmittingAnswer(true);
    setError("");
    setSelected(optionId);
    const submissionKey = crypto.randomUUID();
    const draftKey = `answer:${question.blockId}:${question.position}`;
    localStorage.setItem(draftKey, optionId);
    try {
      const response = await fetch(
        `/api/study/blocks/${question.blockId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position: question.position,
            selectedOptionId: optionId,
            submissionKey,
            timeSpentMs: Date.now() - viewedAt.current,
          }),
        },
      );
      const data = (await response.json()) as Question & { error?: string };
      if (!response.ok) throw new Error(data.error);
      setQuestion((current) => ({
        ...data,
        imageUrl: data.imageUrl ?? current.imageUrl,
      }));
      setRemaining(null);
      localStorage.removeItem(draftKey);
      return true;
    } catch {
      setError(
        "Answer was not confirmed. Your selection remains on this device; retry before leaving the question.",
      );
      return false;
    } finally {
      setLoading(false);
      setSubmittingAnswer(false);
    }
  }

  async function chooseOption(optionId: string) {
    if (question.answered || loading) return;
    setSelected(optionId);
    if (question.mode === "tutor") await submit(optionId);
  }

  async function toggleMark() {
    const next = !question.marked;
    setQuestion({ ...question, marked: next });
    try {
      const response = await fetch(
        `/api/study/blocks/${question.blockId}/mark`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: question.position, marked: next }),
        },
      );
      if (!response.ok) throw new Error();
    } catch {
      setQuestion({ ...question, marked: !next });
      setError("Mark could not be saved.");
    }
  }

  function addSelectedHighlight() {
    const selection = window.getSelection();
    if (!stemRef.current) return;
    const selectedHighlight = selectedTextHighlight(stemRef.current, selection);
    if (!selectedHighlight) return;
    const next = normalizeHighlights(
      [...highlights, selectedHighlight],
      question.stem.length,
    );
    setHighlights(next);
    writeQuestionHighlights(question.questionId, next);
    selection?.removeAllRanges();
  }

  function removeAllHighlights() {
    setHighlights([]);
    writeQuestionHighlights(question.questionId, []);
  }

  async function saveNote() {
    setNoteStatus("Saving…");
    try {
      const response = await fetch("/api/study/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.questionId, note }),
      });
      if (!response.ok) throw new Error();
      setNoteStatus("Saved");
      setQuestion({ ...question, privateNote: note });
    } catch {
      setNoteStatus("Not saved. Retry.");
    }
  }

  async function requestAiAssist() {
    setAiOpen(true);
    if (aiStatus === "ready" || aiStatus === "loading") return;
    setAiStatus("loading");
    setAiText("");
    try {
      const response = await fetch("/api/study/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: question.blockId,
          position: question.position,
        }),
      });
      const result = (await response.json()) as {
        text?: string;
        error?: string;
      };
      if (!response.ok || !result.text)
        throw new Error(result.error ?? "AI assist is unavailable.");
      setAiText(result.text);
      setAiStatus("ready");
    } catch (assistError) {
      setAiText(
        assistError instanceof Error
          ? assistError.message
          : "AI assist is unavailable.",
      );
      setAiStatus("error");
    }
  }

  async function completeBlock() {
    if (completing.current) return;
    completing.current = true;
    setEndingTest(true);
    const response = await fetch(
      `/api/study/blocks/${question.blockId}/complete`,
      { method: "POST" },
    );
    if (response.ok) router.push(`/study/block/${question.blockId}/results`);
    else {
      completing.current = false;
      setEndingTest(false);
      setError("Test could not be completed. Retry.");
    }
  }

  async function suspendBlock() {
    if (!window.confirm("Suspend this test and return to your dashboard?"))
      return;
    const response = await fetch(
      `/api/study/blocks/${question.blockId}/suspend`,
      { method: "POST" },
    );
    if (response.ok) router.push("/dashboard");
    else setError("Test could not be suspended.");
  }

  async function nextQuestion() {
    if (question.mode === "timed" && selected && !question.answered) {
      const saved = await submit(selected);
      if (!saved) return;
    }
    if (question.position === question.total) setEndTestOpen(true);
    else await load(question.position + 1);
  }

  useEffect(() => {
    setHighlights(
      readQuestionHighlights(question.questionId, question.stem.length),
    );
  }, [question.questionId, question.stem.length]);

  useEffect(() => {
    const saved = localStorage.getItem(
      `answer:${question.blockId}:${question.position}`,
    );
    if (saved && !question.answered) setSelected(saved);
  }, [question.blockId, question.position, question.answered]);

  useEffect(() => {
    if (question.mode !== "timed" || question.answered || remaining === null)
      return;
    if (remaining <= 0) {
      if (expiredPosition.current === question.position) return;
      expiredPosition.current = question.position;
      void (async () => {
        if (selected) {
          const saved = await submit(selected);
          if (!saved) {
            setError("Time expired before the selected answer was confirmed.");
          }
        }
        if (question.position === question.total) await completeBlock();
        else await load(question.position + 1);
      })();
      return;
    }
    const timer = window.setTimeout(
      () => setRemaining((current) => Math.max(0, (current ?? 1) - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [
    question.mode,
    question.answered,
    question.position,
    question.total,
    remaining,
    selected,
  ]);

  const answeredCount = useMemo(
    () => question.navigator.filter((item) => item.answered).length,
    [question.navigator],
  );
  const questionWindow = useMemo(
    () => getPageWindow(question.position, question.total),
    [question.position, question.total],
  );
  const unansweredCount = question.navigator.filter(
    (item) => !item.answered,
  ).length;

  return (
    <div className="min-h-screen bg-field pb-24">
      <header className="sticky top-[30px] z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-700">
              {question.mode === "tutor" ? "Untimed" : "Timed"} mode
            </p>
            <p className="font-normal tracking-[0.02em]">
              Question {question.position} of {question.total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {remaining !== null && (
              <span
                aria-label="Time remaining for this question"
                className={`px-3 py-2 font-mono font-bold ${
                  remaining <= 15 ? "bg-red-100 text-red-800" : "bg-field"
                }`}
              >
                {formatClock(remaining)}
              </span>
            )}
            <button
              type="button"
              onClick={() => void suspendBlock()}
              className="button-secondary min-h-11 px-3"
            >
              Suspend
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 h-1 overflow-hidden bg-brand-100">
          <div
            className="h-full bg-brand-600"
            style={{ width: `${(question.position / question.total) * 100}%` }}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900"
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700"
            aria-live="polite"
          >
            <LoadingSpinner size="sm" label="Loading question" />
            {submittingAnswer ? "Checking answer…" : "Updating question…"}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={question.questionId}
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border border-line bg-white p-5 shadow-card sm:p-7"
          >
            <p
              ref={stemRef}
              onMouseUp={addSelectedHighlight}
              onTouchEnd={addSelectedHighlight}
              className="whitespace-pre-wrap text-lg leading-8 selection:bg-yellow-200"
            >
              <HighlightedText
                text={question.stem}
                phrases={question.keyPhrases ?? []}
                active={keyInfoVisible}
                highlights={highlights}
              />
            </p>
            {question.imageUrl && (
              // Signed private URLs are short-lived and cannot be statically configured for next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.imageUrl}
                alt="Clinical question illustration"
                className="mt-5 max-h-96 w-full rounded-lg object-contain"
              />
            )}

            <div className="mt-6 flex flex-wrap gap-2 border-y border-line py-3">
              <ActionButton
                active={question.marked}
                onClick={() => void toggleMark()}
                label={question.marked ? "★ Marked" : "☆ Mark"}
              />
              <ActionButton
                active={false}
                disabled={highlights.length === 0}
                onClick={removeAllHighlights}
                label="Remove all highlights"
              />
              <ActionButton
                active={noteOpen || note.trim().length > 0}
                onClick={() => setNoteOpen(true)}
                label={note.trim() ? "Notes saved" : "Add notes"}
              />
              <ActionButton
                active={keyInfoVisible}
                disabled={(question.keyPhrases ?? []).length === 0}
                onClick={() => setKeyInfoVisible((current) => !current)}
                label="Key info"
              />
              <ActionButton
                active={aiOpen}
                onClick={() => void requestAiAssist()}
                label="AI assist"
              />
              <PlayerUtilities />
            </div>

            {aiOpen && (
              <aside className="mt-4 border border-brand-200 bg-soft p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-normal tracking-[0.02em] text-ink">
                    AI second opinion
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAiOpen(false)}
                    className="min-h-11 px-2 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
                {aiStatus === "loading" && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-body">
                    <LoadingSpinner
                      size="sm"
                      label="Generating AI assistance"
                    />
                    Thinking…
                  </div>
                )}
                {(aiStatus === "ready" || aiStatus === "error") && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">
                    {aiText}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted">
                  Educational reasoning support only. AI assist is instructed
                  not to reveal the answer and is not medical advice.
                </p>
              </aside>
            )}

            <fieldset className="mt-7 space-y-4">
              <legend className="sr-only">Answer choices</legend>
              {question.options.map((option, index) => {
                const correct =
                  question.answered && question.correctOptionId === option.id;
                const chosen = selected === option.id;
                const explanationStyle = correct
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-red-300 bg-red-50 text-red-950";
                return (
                  <div key={option.id}>
                    <label
                      className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                        correct
                          ? "border-emerald-500 bg-emerald-50"
                          : chosen && question.answered
                            ? "border-red-500 bg-red-50"
                            : chosen
                              ? "border-brand-600 bg-brand-50"
                              : "border-line"
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option.id}
                        checked={chosen}
                        disabled={question.answered || loading}
                        onChange={() => void chooseOption(option.id)}
                        className="mt-1 h-5 w-5"
                      />
                      <span
                        className={`min-w-0 flex-1 ${
                          struck.includes(option.id)
                            ? "line-through opacity-50"
                            : ""
                        }`}
                      >
                        <strong className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                          {String.fromCharCode(65 + index)}
                        </strong>
                        <span>{option.text}</span>
                      </span>
                      {question.answered &&
                        question.optionStats?.[option.id] !== undefined && (
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-700">
                            {question.optionStats[option.id]}% answered
                          </span>
                        )}
                      {!question.answered && (
                        <button
                          type="button"
                          aria-label={`Strike option ${String.fromCharCode(65 + index)}`}
                          onClick={(event) => {
                            event.preventDefault();
                            setStruck((current) =>
                              current.includes(option.id)
                                ? current.filter((id) => id !== option.id)
                                : [...current, option.id],
                            );
                          }}
                          className="min-h-11 shrink-0 px-2 text-xs font-bold"
                        >
                          abc̶
                        </button>
                      )}
                    </label>

                    {question.answered &&
                      chosen &&
                      question.rationales?.[option.id] && (
                        <p
                          className={`mt-2 border px-4 py-3 text-sm leading-6 ${explanationStyle}`}
                        >
                          {question.rationales[option.id]}
                        </p>
                      )}
                  </div>
                );
              })}
            </fieldset>

            {question.mode === "timed" && !question.answered && (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!selected || loading}
                className="button-primary mt-6 w-full disabled:opacity-50 sm:w-auto"
              >
                Save answer
              </button>
            )}

            {question.answered && question.explanation && (
              <Explanation question={question} />
            )}
          </motion.article>
        </AnimatePresence>

        <section className="mt-5 border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-normal tracking-[0.02em]">
              Question navigator
            </h2>
            <span className="text-sm text-muted">
              {answeredCount}/{question.total} answered
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Show previous 10 questions"
              disabled={!questionWindow.previousWindowPage || loading}
              onClick={() =>
                questionWindow.previousWindowPage &&
                void load(questionWindow.previousWindowPage)
              }
              className="h-11 w-11 shrink-0 border border-line text-xl font-bold disabled:opacity-30"
            >
              ‹
            </button>
            <div className="grid min-w-0 grid-cols-5 gap-2 sm:grid-cols-10">
              {question.navigator
                .slice(questionWindow.start - 1, questionWindow.end)
                .map((item) => (
                  <button
                    key={item.position}
                    type="button"
                    onClick={() => void load(item.position)}
                    disabled={loading}
                    aria-label={`Question ${item.position}${item.answered ? ", answered" : ""}${item.marked ? ", marked" : ""}`}
                    aria-current={
                      item.position === question.position ? "page" : undefined
                    }
                    className={`h-11 min-w-9 px-2 text-sm font-bold disabled:opacity-50 ${
                      item.position === question.position
                        ? "bg-ink text-white"
                        : item.answered
                          ? "bg-brand-100 text-brand-900"
                          : "bg-field"
                    }`}
                  >
                    {item.marked ? "★" : ""}
                    {item.position}
                  </button>
                ))}
            </div>
            <button
              type="button"
              aria-label="Show next 10 questions"
              disabled={!questionWindow.nextWindowPage || loading}
              onClick={() =>
                questionWindow.nextWindowPage &&
                void load(questionWindow.nextWindowPage)
              }
              className="h-11 w-11 shrink-0 border border-line text-xl font-bold disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => void load(question.position - 1)}
            disabled={question.position === 1 || loading}
            className="button-secondary min-h-12 disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => setEndTestOpen(true)}
            className="min-h-12 font-semibold text-red-700"
          >
            End test
          </button>
          <button
            type="button"
            onClick={() => void nextQuestion()}
            disabled={loading}
            className="button-primary min-h-12 disabled:opacity-40"
          >
            {loading ? (
              <LoadingSpinner size="sm" label="Loading next question" />
            ) : question.position === question.total ? (
              "Finish →"
            ) : (
              "Next →"
            )}
          </button>
        </div>
      </nav>

      {endTestOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-test-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md border border-line bg-white p-6 shadow-card">
            <h2 id="end-test-title" className="text-xl font-bold text-ink">
              Are you sure you want to end this test?
            </h2>
            {unansweredCount > 0 && (
              <p className="mt-2 text-sm leading-6 text-muted">
                {unansweredCount} question
                {unansweredCount === 1 ? " is" : "s are"} still unanswered.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={endingTest}
                onClick={() => setEndTestOpen(false)}
                className="button-secondary min-h-11 px-5 disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                disabled={endingTest}
                onClick={() => void completeBlock()}
                className="min-h-11 bg-red-700 px-5 font-bold text-white disabled:opacity-50"
              >
                {endingTest ? (
                  <LoadingSpinner size="sm" label="Ending test" />
                ) : (
                  "Yes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {noteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-title"
          className="fixed inset-0 z-40 flex items-end bg-black/40 sm:items-center sm:justify-center"
        >
          <div className="w-full bg-white p-5 sm:max-w-lg sm:rounded-xl">
            <div className="flex justify-between">
              <h2 id="note-title" className="text-xl font-bold">
                Private note
              </h2>
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                className="min-h-11 px-3"
              >
                Close
              </button>
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={10000}
              className="input min-h-48 p-3"
              placeholder="Add your private study notes for this question."
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{noteStatus}</span>
              <button
                type="button"
                onClick={() => void saveNote()}
                className="min-h-11 rounded-none bg-black px-5 font-bold text-white"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  active,
  disabled = false,
  onClick,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 border px-3 text-sm font-normal disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-black bg-black text-white" : "border-line"
      }`}
    >
      {label}
    </button>
  );
}

function HighlightedText({
  text,
  phrases,
  active,
  highlights,
}: {
  text: string;
  phrases: string[];
  active: boolean;
  highlights: TextHighlight[];
}) {
  const phraseHighlights: TextHighlight[] = [];
  if (active && phrases.length > 0) {
    const pattern = phrases
      .slice()
      .sort((left, right) => right.length - left.length)
      .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    if (pattern) {
      for (const match of text.matchAll(new RegExp(pattern, "gi"))) {
        if (match.index !== undefined) {
          phraseHighlights.push({
            start: match.index,
            end: match.index + match[0].length,
          });
        }
      }
    }
  }

  const visibleHighlights = normalizeHighlights(
    [...highlights, ...phraseHighlights],
    text.length,
  );
  if (visibleHighlights.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  visibleHighlights.forEach(({ start, end }) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark
        key={`${start}-${end}`}
        className="rounded bg-yellow-200 px-0.5 text-inherit"
      >
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function Explanation({ question }: { question: Question }) {
  return (
    <details
      open
      className={`mt-7 rounded-xl border p-5 ${
        question.isCorrect
          ? "border-emerald-300 bg-emerald-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <summary className="cursor-pointer text-xl font-bold">
        {question.isCorrect
          ? "Correct — full explanation"
          : "Incorrect — full explanation"}
      </summary>
      <p className="mt-3 whitespace-pre-wrap leading-7">
        {question.explanation}
      </p>
      {question.educationalObjective && (
        <div className="mt-4">
          <h3 className="font-bold">Educational objective</h3>
          <p className="mt-1">{question.educationalObjective}</p>
        </div>
      )}
      {question.highYieldSummary && (
        <div className="mt-4">
          <h3 className="font-bold">High-yield summary</h3>
          <p className="mt-1">{question.highYieldSummary}</p>
        </div>
      )}
      {question.usSystemContextNote && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <h3 className="font-bold text-blue-950">US clinical context</h3>
          <p className="mt-1 text-blue-950">{question.usSystemContextNote}</p>
        </div>
      )}
      {question.glossary && question.glossary.length > 0 && (
        <dl className="mt-4">
          {question.glossary.map((item) => (
            <div key={item.term}>
              <dt className="font-bold">{item.term}</dt>
              <dd className="text-slate-700">{item.definition}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-sm text-slate-600">
        {question.responseCount
          ? `Based on ${question.responseCount.toLocaleString()} recorded response${
              question.responseCount === 1 ? "" : "s"
            }.`
          : "No peer responses have been recorded yet."}
      </p>
    </details>
  );
}
