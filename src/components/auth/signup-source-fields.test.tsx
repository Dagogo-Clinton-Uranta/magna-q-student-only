import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignupSourceFields } from "./signup-source-fields";

describe("SignupSourceFields", () => {
  it("shows the free-text field only when Other is selected", () => {
    render(<SignupSourceFields />);

    expect(screen.queryByLabelText("Please specify")).toBeNull();

    fireEvent.change(screen.getByLabelText("How did you hear about us?"), {
      target: { value: "other" },
    });

    expect(
      (screen.getByLabelText("Please specify") as HTMLInputElement).required,
    ).toBe(true);
  });
});
