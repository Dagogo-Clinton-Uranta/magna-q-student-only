"use client";

import { useRef, useState } from "react";

export function UsernameInput({
  defaultValue,
  allowCurrent = false,
}: {
  defaultValue?: string;
  allowCurrent?: boolean;
} = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestNumber = useRef(0);
  const [message, setMessage] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);

  async function checkAvailability() {
    const input = inputRef.current;
    if (!input) return;
    const username = input.value.trim().toLowerCase();
    input.value = username;
    input.setCustomValidity("");
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      setAvailable(false);
      setMessage("Use 3–24 lowercase letters, numbers, or underscores.");
      input.setCustomValidity("Choose a valid username.");
      return;
    }

    const currentRequest = ++requestNumber.current;
    setMessage("Checking availability…");
    try {
      const response = await fetch(
        `/api/auth/username-availability?username=${encodeURIComponent(username)}${allowCurrent ? "&allowCurrent=1" : ""}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        available?: boolean;
        message?: string;
      };
      if (currentRequest !== requestNumber.current) return;
      const isAvailable = response.ok && result.available === true;
      setAvailable(isAvailable);
      setMessage(
        isAvailable
          ? "Username is available."
          : result.message || "That username is already taken.",
      );
      input.setCustomValidity(
        isAvailable ? "" : "That username is unavailable.",
      );
    } catch {
      if (currentRequest !== requestNumber.current) return;
      setAvailable(false);
      setMessage("Could not check this username. Please try again.");
      input.setCustomValidity("Username availability could not be checked.");
    }
  }

  return (
    <label className="block text-sm">
      <span className="uppercase tracking-[0.08em]">Username</span>
      <input
        ref={inputRef}
        name="username"
        defaultValue={defaultValue}
        required
        minLength={3}
        maxLength={24}
        pattern="[a-z0-9_]+"
        autoComplete="username"
        className="input"
        aria-describedby="username-status"
        onChange={() => {
          requestNumber.current += 1;
          inputRef.current?.setCustomValidity("");
          setAvailable(null);
          setMessage("");
        }}
        onBlur={checkAvailability}
      />
      <span
        id="username-status"
        aria-live="polite"
        className={`mt-1 block text-xs ${available === true ? "text-green-700" : available === false ? "text-red-700" : "text-muted"}`}
      >
        {message || "3–24 lowercase letters, numbers, or underscores."}
      </span>
    </label>
  );
}
