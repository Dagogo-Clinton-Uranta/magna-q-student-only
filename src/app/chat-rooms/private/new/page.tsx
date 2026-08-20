import { AppShell } from "@/components/layout/app-shell";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createPrivateGroup } from "../../actions";

export default async function NewPrivateGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requirePaidStudent("/chat-rooms/private/new");
  const { error } = await searchParams;
  return (
    <AppShell title="Create a private group" name={profile.fullName}>
      <p className="mt-3 max-w-2xl leading-7 text-slate-700">
        Tell the review team why this focused room will help. Your room becomes
        available only after an administrator approves it.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </p>
      )}
      <form
        action={createPrivateGroup}
        className="mt-6 max-w-3xl space-y-5 border border-line bg-white p-6"
      >
        <label className="block text-sm font-semibold">
          Group name
          <input
            name="groupName"
            required
            minLength={3}
            maxLength={80}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm font-semibold">
          Reason for creating the chat room
          <textarea
            name="reason"
            required
            rows={4}
            minLength={10}
            maxLength={1000}
            className="input mt-1 resize-y"
          />
        </label>
        <label className="block text-sm font-semibold">
          What do you aim to achieve through this chat room?
          <textarea
            name="goal"
            required
            rows={8}
            minLength={10}
            maxLength={2000}
            className="input mt-1 resize-y"
          />
        </label>
        <FormSubmitButton pendingLabel="Submitting for review…">
          Submit for review
        </FormSubmitButton>
      </form>
    </AppShell>
  );
}
