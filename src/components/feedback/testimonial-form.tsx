"use client";

import { useState, useTransition } from "react";
import { submitFeedbackTestimonial } from "@/app/feedback/actions";
import {
  ReviewChoice,
  StarRating,
} from "@/components/profile/stage-rank-selector";

export function TestimonialForm() {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError("Choose a star rating before submitting.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));
    setError("");

    startTransition(async () => {
      const result = await submitFeedbackTestimonial(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setRating(0);
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={submitReview} className="mt-6 space-y-5">
      {submitted && (
        <p
          role="status"
          className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          Thank you. Your review has been saved.
        </p>
      )}
      <label className="block text-sm uppercase tracking-[0.08em]">
        Your review
        <textarea
          name="comment"
          required
          minLength={3}
          maxLength={5000}
          rows={6}
          className="input resize-y p-3 normal-case tracking-normal"
          placeholder="How has Magna-Q supported you so far?"
        />
      </label>
      <div>
        <p className="text-sm uppercase tracking-[0.08em]">
          Satisfaction rating
        </p>
        <StarRating value={rating} onChange={setRating} />
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {rating === 0 ? "No rating selected" : `${rating} out of 5 stars`}
        </p>
      </div>
      <ReviewChoice name="foundUseful" legend="Did you find Magna-Q useful?" />
      <ReviewChoice
        name="wouldRecommend"
        legend="Would you recommend Magna-Q to a friend?"
      />
      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="button-primary" disabled={isPending}>
        {isPending ? "Saving review…" : "Submit review"}
      </button>
    </form>
  );
}
