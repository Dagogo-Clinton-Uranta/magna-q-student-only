import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { submitFeedback } from "./actions";
import { TestimonialForm } from "@/components/feedback/testimonial-form";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { error, submitted } = await searchParams;

  return (
    <AppShell title="Feedback" name={profile.fullName}>
      <WorkspaceHero image="journey" className="mt-6 max-w-3xl">
        <p className="eyebrow">Help shape Magna-Q</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Tell us what would improve your preparation
        </h2>
        <p className="mt-3 leading-7 text-muted">
          Make your suggestions here, whether it&apos;s the interview practice,
          the quality of questions, or any new features you want to see. We only
          want to make the platform better for you. Feedback is anonymous.
        </p>

        {submitted && (
          <p
            role="status"
            className="mt-6 border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"
          >
            Thank you. Your anonymous feedback has been saved.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-6 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
          >
            {error}
          </p>
        )}

        <form action={submitFeedback} className="mt-7 space-y-5">
          <label className="block">
            <span className="text-sm uppercase tracking-[0.08em]">Subject</span>
            <input
              name="subject"
              type="text"
              required
              minLength={3}
              maxLength={160}
              className="input"
              placeholder="What is your feedback about?"
            />
          </label>
          <label className="block">
            <span className="text-sm uppercase tracking-[0.08em]">
              Your suggestion
            </span>
            <textarea
              name="feedback"
              rows={8}
              required
              minLength={10}
              maxLength={5000}
              className="input resize-y p-3"
              placeholder="Make your suggestion here…"
            />
          </label>
          <p className="text-sm leading-6 text-muted">
            Your name, email address and account ID are not saved with this
            feedback. We save only your country of residence and the submission
            time.
          </p>
          <button type="submit" className="button-primary">
            Submit feedback
          </button>
        </form>
      </WorkspaceHero>

      <WorkspaceHero image="guidelines" className="mt-6 max-w-3xl">
        <p className="eyebrow">Leave a review or testimonial</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Share your experience
        </h2>
        <p className="mt-3 leading-7 text-muted">
          How has Magna-Q supported you so far? Tell us whether you found the
          platform useful and whether you would recommend it to a friend.
        </p>
        <TestimonialForm />
      </WorkspaceHero>
    </AppShell>
  );
}
