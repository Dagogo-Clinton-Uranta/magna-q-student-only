"use client";

import React, { useState } from "react";

export function SignupSourceFields() {
  const [source, setSource] = useState("");

  return (
    <>
      <label className="block text-sm sm:col-span-2">
        <span className="uppercase tracking-[0.08em]">
          How did you hear about us?
        </span>
        <select
          name="signupSource"
          required
          value={source}
          onChange={(event) => setSource(event.target.value)}
          className="input"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="twitter">Twitter</option>
          <option value="google">Google</option>
          <option value="word_of_mouth">Word of mouth</option>
          <option value="instagram">Instagram</option>
          <option value="magna_q_agent">Magna-Q agent</option>
          <option value="other">Other</option>
        </select>
      </label>
      {source === "other" && (
        <label className="block text-sm sm:col-span-2">
          <span className="uppercase tracking-[0.08em]">Please specify</span>
          <input
            name="signupSourceOther"
            required
            maxLength={120}
            autoComplete="off"
            className="input"
          />
        </label>
      )}
    </>
  );
}
