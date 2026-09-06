import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Step1BlockBuilder,
  Step2BlockBuilder,
  type Step1BuilderMap,
  type Step2BuilderMap,
} from "./step2-block-builder";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const selectionMap: Step2BuilderMap = {
  systems: [
    {
      id: "20000000-0000-0000-0000-000000000001",
      code: "CVS",
      name: "Cardiovascular System",
      count: 12,
    },
  ],
  clinicalSciences: [
    {
      id: "30000000-0000-0000-0000-000000000001",
      code: "MED",
      name: "Medicine",
      count: 10,
    },
  ],
  competencies: [
    {
      id: "40000000-0000-0000-0000-000000000001",
      code: "pharmacotherapy",
      name: "Patient Care: Pharmacotherapy",
      count: 4,
    },
  ],
  topics: [
    {
      key: "20000000-0000-0000-0000-000000000001:Acute coronary syndrome",
      name: "Acute coronary syndrome",
      systemId: "20000000-0000-0000-0000-000000000001",
      count: 3,
    },
  ],
  nutritionCount: 2,
};

const step1SelectionMap: Step1BuilderMap = {
  systems: selectionMap.systems,
  disciplines: [
    {
      id: "30000000-0000-0000-0000-000000000001",
      code: "PHY",
      name: "Physiology",
      count: 10,
      officialAxis: true,
    },
    {
      id: "30000000-0000-0000-0000-000000000002",
      code: "EPI",
      name: "Epidemiology",
      count: 2,
      officialAxis: false,
    },
  ],
  competencies: [
    {
      id: "40000000-0000-0000-0000-000000000001",
      code: "foundational-science",
      name: "Medical Knowledge: Applying Foundational Science Concepts",
      count: 8,
    },
  ],
  topics: selectionMap.topics,
};

describe("Step2BlockBuilder", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the independent Step 2 CK selection axes", () => {
    render(
      <Step2BlockBuilder
        exam={{
          id: "10000000-0000-0000-0000-000000000001",
          name: "USMLE Step 2 CK",
        }}
        selectionMap={selectionMap}
      />,
    );

    expect(screen.getByRole("heading", { name: "Organ system" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Clinical science" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Patient-care task" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Topic" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Nutrition focus" }),
    ).toBeTruthy();
    expect(screen.getByText("Acute coronary syndrome")).toBeTruthy();
  });

  it("offers the 20-question Step 2 CK block maximum instead of 40", () => {
    render(
      <Step2BlockBuilder
        exam={{
          id: "10000000-0000-0000-0000-000000000001",
          name: "USMLE Step 2 CK",
        }}
        selectionMap={selectionMap}
      />,
    );

    expect(screen.getByRole("button", { name: "20" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "40" })).toBeNull();
    expect(screen.getByText(/maximum 20/i)).toBeTruthy();
  });
});

describe("Step1BlockBuilder", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders Step 1's own discipline and competency map without a nutrition-axis section", () => {
    render(
      <Step1BlockBuilder
        exam={{
          id: "10000000-0000-0000-0000-000000000001",
          name: "USMLE Step 1",
        }}
        selectionMap={step1SelectionMap}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Science discipline" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Task or competency" }),
    ).toBeTruthy();
    expect(screen.getByText("Supporting discipline")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Nutrition focus" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "20" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "40" })).toBeNull();
  });
});
