import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SettingsPanel } from "./settings-panel";

describe("SettingsPanel", () => {
  afterEach(cleanup);

  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it("applies and persists dark mode", () => {
    render(<SettingsPanel />);
    const darkMode = screen.getByRole("switch", { name: "Dark mode" });

    fireEvent.click(darkMode);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("magna-q-theme")).toBe("dark");
    expect(darkMode.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(darkMode);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("magna-q-theme")).toBe("light");
  });

  it("renders circular toggle tracks and thumbs", () => {
    render(<SettingsPanel />);

    const toggles = screen.getAllByRole("switch");
    expect(toggles).toHaveLength(2);
    for (const toggle of toggles) {
      const track = toggle.nextElementSibling;
      expect(track?.className).toContain("settings-toggle");
      expect(track?.firstElementChild?.className).toContain(
        "settings-toggle__thumb",
      );
    }
  });

  it("places all supported study languages below dark mode", () => {
    render(<SettingsPanel initialLocale="fr" />);

    const darkMode = screen.getByRole("switch", { name: "Dark mode" });
    const language = screen.getByRole("combobox", { name: "Study language" });
    expect(language.compareDocumentPosition(darkMode)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect((language as HTMLSelectElement).value).toBe("fr");
    expect(screen.getAllByRole("option")).toHaveLength(6);
  });

  it("toggles email notifications and explains their availability", () => {
    render(<SettingsPanel />);
    const emailNotifications = screen.getByRole("switch", {
      name: "Turn on email notifications",
    });

    fireEvent.click(emailNotifications);

    expect(emailNotifications.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain(
      "Email notifications are coming in the next patch.",
    );

    fireEvent.click(emailNotifications);

    expect(emailNotifications.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
