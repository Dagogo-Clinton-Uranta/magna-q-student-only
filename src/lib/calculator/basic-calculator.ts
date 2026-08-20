export type CalculatorState = {
  display: string;
  accumulator: number | null;
  operation: "+" | "-" | "×" | "÷" | null;
  replace: boolean;
};
export const initialCalculatorState: CalculatorState = {
  display: "0",
  accumulator: null,
  operation: null,
  replace: false,
};
function apply(
  left: number,
  right: number,
  operation: CalculatorState["operation"],
) {
  if (operation === "+") return left + right;
  if (operation === "-") return left - right;
  if (operation === "×") return left * right;
  if (operation === "÷") return right === 0 ? NaN : left / right;
  return right;
}
export function calculatorInput(
  state: CalculatorState,
  key: string,
): CalculatorState {
  if (/^\d$/.test(key)) {
    const display =
      state.replace || state.display === "0"
        ? key
        : (state.display + key).slice(0, 16);
    return { ...state, display, replace: false };
  }
  if (key === ".") {
    if (state.display.includes(".") && !state.replace) return state;
    return {
      ...state,
      display: state.replace ? "0." : `${state.display}.`,
      replace: false,
    };
  }
  if (key === "C") return initialCalculatorState;
  if (key === "⌫")
    return {
      ...state,
      display: state.display.length > 1 ? state.display.slice(0, -1) : "0",
    };
  if (key === "%")
    return {
      ...state,
      display: String(Number(state.display) / 100),
      replace: true,
    };
  if (["+", "-", "×", "÷"].includes(key)) {
    const value = Number(state.display);
    const accumulator =
      state.accumulator !== null && state.operation
        ? apply(state.accumulator, value, state.operation)
        : value;
    return {
      display: String(accumulator),
      accumulator,
      operation: key as CalculatorState["operation"],
      replace: true,
    };
  }
  if (key === "=" && state.accumulator !== null && state.operation) {
    const result = apply(
      state.accumulator,
      Number(state.display),
      state.operation,
    );
    return {
      display: Number.isFinite(result) ? String(result) : "Error",
      accumulator: null,
      operation: null,
      replace: true,
    };
  }
  return state;
}
