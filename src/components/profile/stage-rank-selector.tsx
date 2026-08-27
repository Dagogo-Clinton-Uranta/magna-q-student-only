"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeStudyStage,
  submitStageTestimonial,
} from "@/app/profile/actions";
import {
  getStageDefinition,
  STAGE_DEFINITIONS,
  type StudentStage,
} from "@/lib/stages";

type StageTransition = { fromStage: StudentStage; toStage: StudentStage };

export function StageRankSelector({
  initialStage,
}: {
  initialStage: StudentStage;
}) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewTransition, setReviewTransition] =
    useState<StageTransition | null>(null);
  const [changeError, setChangeError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [rating, setRating] = useState(0);
  const [isChanging, startChanging] = useTransition();
  const [isReviewing, startReviewing] = useTransition();
  const current = getStageDefinition(currentStage);
  const selected = getStageDefinition(selectedStage);

  useEffect(() => setCurrentStage(initialStage), [initialStage]);

  function requestChange() {
    setChangeError("");
    if (selectedStage === currentStage) {
      setChangeError("Choose a different stage to continue.");
      return;
    }
    setConfirmOpen(true);
  }

  function confirmChange() {
    const formData = new FormData();
    formData.set("studyStage", selectedStage);
    startChanging(async () => {
      const result = await changeStudyStage(formData);
      if (!result.ok) {
        setChangeError(result.error);
        setConfirmOpen(false);
        return;
      }
      setCurrentStage(result.toStage);
      setConfirmOpen(false);
      setReviewTransition({
        fromStage: result.fromStage,
        toStage: result.toStage,
      });
    });
  }

  function closeReview() {
    setReviewTransition(null);
    setRating(0);
    setReviewError("");
    router.refresh();
  }

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewTransition) return;
    if (rating === 0) {
      setReviewError("Choose a star rating before submitting.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set("rating", String(rating));
    formData.set("fromStage", reviewTransition.fromStage);
    formData.set("toStage", reviewTransition.toStage);
    setReviewError("");
    startReviewing(async () => {
      const result = await submitStageTestimonial(formData);
      if (!result.ok) {
        setReviewError(result.error);
        return;
      }
      closeReview();
    });
  }

  return (
    <>
      <section
        className="mt-8 border-2 border-brand-400 bg-soft p-6 shadow-card sm:p-8"
        aria-labelledby="current-stage-title"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Your current stage</p>
            <h2 id="current-stage-title" className="mt-2 text-3xl text-ink">
              Stage {current.rank}: {current.label}
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted">
              Your stage controls which practice tools, learning resources, and
              guidelines appear in your workspace. Blogs, chat rooms, residency
              programs, and applicant events always remain available.
            </p>
          </div>
          <StethoscopeRank rank={current.rank} className="h-28 w-28 shrink-0" />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAGE_DEFINITIONS.map((stage) => {
            const checked = selectedStage === stage.value;
            const active = currentStage === stage.value;
            return (
              <button
                key={stage.value}
                type="button"
                onClick={() => setSelectedStage(stage.value)}
                aria-pressed={checked}
                className={`flex min-h-40 flex-col items-start border p-4 text-left transition ${
                  checked
                    ? "border-brand-700 bg-surface shadow-card"
                    : "border-brand-200 bg-surface/70 hover:border-brand-500"
                }`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <StethoscopeRank rank={stage.rank} className="h-12 w-12" />
                  <span className="text-xs uppercase tracking-[0.14em] text-brand-700">
                    Stage {stage.rank}
                  </span>
                </div>
                <span className="mt-3 font-semibold text-ink">
                  {stage.label}
                </span>
                <span className="mt-1 text-sm leading-5 text-muted">
                  {stage.description}
                </span>
                {active && (
                  <span className="mt-auto pt-3 text-xs font-bold uppercase tracking-widest text-brand-800">
                    Current stage
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {changeError && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-700">
            {changeError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="button-primary"
            disabled={selectedStage === currentStage || isChanging}
            onClick={requestChange}
          >
            Change to {selected.shortLabel}
          </button>
          <p className="text-sm text-muted">
            You can move forward or return to an earlier stage at any time.
          </p>
        </div>
      </section>

      {confirmOpen && (
        <Modal
          title="Confirm your new stage"
          onClose={() => setConfirmOpen(false)}
        >
          <p className="text-lg leading-7 text-ink">
            Are you sure you want to change your current level?
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your workspace will switch from {current.label} to {selected.label}.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="button-ghost border border-line"
              disabled={isChanging}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-primary"
              disabled={isChanging}
              onClick={confirmChange}
            >
              {isChanging ? "Changing level…" : "Yes, change my level"}
            </button>
          </div>
        </Modal>
      )}

      {reviewTransition && (
        <Modal title="Share your experience" onClose={closeReview} dismissible>
          <p className="leading-7 text-ink">
            Would you like to leave a review on how Magna-Q helped you during
            your current level, whether you found us useful or not, and whether
            you&apos;d recommend us to a friend?
          </p>
          <p className="mt-2 text-sm text-muted">
            This review is optional. You can close this window without
            submitting.
          </p>
          <form onSubmit={submitReview} className="mt-6 space-y-5">
            <label className="block text-sm uppercase tracking-[0.08em]">
              Your review
              <textarea
                name="comment"
                required
                minLength={3}
                maxLength={5000}
                rows={6}
                className="input resize-y p-3 normal-case tracking-normal"
                placeholder="How did Magna-Q support this stage of your journey?"
              />
            </label>
            <div>
              <p className="text-sm uppercase tracking-[0.08em]">
                Satisfaction rating
              </p>
              <StarRating value={rating} onChange={setRating} />
              <p className="mt-2 text-sm text-muted" aria-live="polite">
                {rating === 0
                  ? "No rating selected"
                  : `${rating} out of 5 stars`}
              </p>
            </div>
            <ReviewChoice
              name="foundUseful"
              legend="Did you find Magna-Q useful?"
            />
            <ReviewChoice
              name="wouldRecommend"
              legend="Would you recommend Magna-Q to a friend?"
            />
            {reviewError && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {reviewError}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="button-ghost border border-line"
                disabled={isReviewing}
                onClick={closeReview}
              >
                Skip review
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isReviewing}
              >
                {isReviewing ? "Saving review…" : "Submit review"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  onClose,
  dismissible = false,
  children,
}: {
  title: string;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!dismissible) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [dismissible, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-brand-300 bg-surface p-6 shadow-lift sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="stage-modal-title" className="text-2xl text-ink">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center border border-line text-xl text-muted"
              aria-label="Close review"
            >
              ×
            </button>
          )}
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

export function ReviewChoice({
  name,
  legend,
}: {
  name: string;
  legend: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm uppercase tracking-[0.08em]">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        {[
          ["yes", "Yes"],
          ["no", "No"],
          ["unsure", "Not sure"],
        ].map(([value, label]) => (
          <label key={value} className="flex min-h-11 items-center gap-2">
            <input
              type="radio"
              name={name}
              value={value}
              required
              className="h-4 w-4 accent-brand-600"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="mt-3 flex w-fit gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));
        return (
          <div key={star} className="relative h-11 w-11">
            <RatingStar fill={fill} />
            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/2 bg-transparent"
              onClick={() => onChange(star - 0.5)}
              role="radio"
              aria-checked={value === star - 0.5}
              aria-label={`${star - 0.5} stars`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/2 bg-transparent"
              onClick={() => onChange(star)}
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} stars`}
            />
          </div>
        );
      })}
    </div>
  );
}

function RatingStar({ fill }: { fill: number }) {
  const rawId = useId();
  const clipId = `star-${rawId.replaceAll(":", "")}`;
  const path =
    "M22 2.5l5.3 10.7 11.8 1.7-8.5 8.3 2 11.7L22 29.4 11.4 35l2-11.7-8.5-8.3 11.8-1.7L22 2.5z";
  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={44 * fill} height="44" />
        </clipPath>
      </defs>
      <path
        d={path}
        fill="rgb(var(--color-line))"
        stroke="rgb(var(--color-brand-700))"
      />
      <path
        d={path}
        fill="rgb(var(--color-brand-500))"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

function StethoscopeRank({
  rank,
  className,
}: {
  rank: 1 | 2 | 3 | 4;
  className: string;
}) {
  const rawId = useId();
  const clipId = `rank-${rawId.replaceAll(":", "")}`;
  const coloredHeight = 80 * (rank / 4);
  const paths = (
    <>
      <path d="M24 12v18c0 13 8 22 20 22s20-9 20-22V12" />
      <path d="M17 12h14M57 12h14" />
      <path d="M44 52v8c0 12 8 21 19 21 9 0 16-6 16-15" />
      <circle cx="79" cy="61" r="7" />
      <circle cx="79" cy="61" r="2" />
    </>
  );
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect
            x="0"
            y={88 - coloredHeight}
            width="96"
            height={coloredHeight}
          />
        </clipPath>
      </defs>
      <g
        fill="none"
        stroke="rgb(var(--color-line))"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths}
      </g>
      <g
        fill="none"
        stroke="rgb(var(--color-brand-500))"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#${clipId})`}
      >
        {paths}
      </g>
    </svg>
  );
}
