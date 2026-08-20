import { describe, expect, it } from "vitest";
import { calculatorInput, initialCalculatorState } from "./basic-calculator";
describe("calculator", () => {
  it("adds without eval", () => {
    let state = initialCalculatorState;
    for (const key of ["2", "+", "3", "="]) state = calculatorInput(state, key);
    expect(state.display).toBe("5");
  });
  it("handles percentage", () => {
    let state = initialCalculatorState;
    for (const key of ["5", "0", "%"]) state = calculatorInput(state, key);
    expect(state.display).toBe("0.5");
  });
});
