import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="button-primary min-h-11 px-4 py-2 text-xs">
        Sign out
      </button>
    </form>
  );
}
