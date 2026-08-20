"use client";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  calculatorInput,
  initialCalculatorState,
} from "@/lib/calculator/basic-calculator";
type Tab = "tutorial" | "calculator" | "settings" | "library";
type Entry = {
  id: string;
  title: string;
  summary: string;
  content: string;
  source_references: Array<{ title?: string; url?: string }>;
};
export function PlayerUtilities() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("calculator");
  const [calculator, setCalculator] = useState(initialCalculatorState);
  const [fontSize, setFontSize] = useState("normal");
  const [contrast, setContrast] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const size = localStorage.getItem("player-font-size") ?? "normal";
    const high = localStorage.getItem("player-high-contrast") === "true";
    setFontSize(size);
    setContrast(high);
    document.documentElement.dataset.playerFont = size;
    document.documentElement.classList.toggle("high-contrast", high);
    if (!localStorage.getItem("player-tutorial-complete")) {
      setTab("tutorial");
      setOpen(true);
    }
  }, []);
  function saveSettings(size: string, high: boolean) {
    setFontSize(size);
    setContrast(high);
    localStorage.setItem("player-font-size", size);
    localStorage.setItem("player-high-contrast", String(high));
    document.documentElement.dataset.playerFont = size;
    document.documentElement.classList.toggle("high-contrast", high);
  }
  async function searchLibrary() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/library?q=${encodeURIComponent(query)}`,
      );
      const result = (await response.json()) as { entries?: Entry[] };
      setEntries(result.entries ?? []);
    } finally {
      setLoading(false);
    }
  }
  function finishTutorial() {
    localStorage.setItem("player-tutorial-complete", "true");
    setOpen(false);
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="min-h-12 font-semibold">
        Tools
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tools-title"
          className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center"
        >
          <div className="max-h-[90vh] w-full overflow-y-auto bg-white p-5 sm:max-w-2xl sm:rounded-xl">
            <div className="flex items-center justify-between">
              <h2 id="tools-title" className="text-xl font-bold">
                Study tools
              </h2>
              <button onClick={() => setOpen(false)} className="min-h-11 px-3">
                Close
              </button>
            </div>
            <div
              role="tablist"
              className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1"
            >
              {(["calculator", "settings", "library", "tutorial"] as Tab[]).map(
                (item) => (
                  <button
                    key={item}
                    role="tab"
                    aria-selected={tab === item}
                    onClick={() => setTab(item)}
                    className={`min-h-11 rounded-md text-sm font-semibold capitalize ${tab === item ? "bg-white shadow-sm" : ""}`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            {tab === "calculator" && (
              <section className="mt-5">
                <output className="block overflow-hidden rounded-lg bg-slate-950 p-4 text-right font-mono text-3xl text-white">
                  {calculator.display}
                </output>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    "C",
                    "⌫",
                    "%",
                    "÷",
                    "7",
                    "8",
                    "9",
                    "×",
                    "4",
                    "5",
                    "6",
                    "-",
                    "1",
                    "2",
                    "3",
                    "+",
                    "0",
                    ".",
                    "=",
                  ].map((key) => (
                    <button
                      key={key}
                      onClick={() =>
                        setCalculator((state) => calculatorInput(state, key))
                      }
                      className={`min-h-12 border border-line font-normal ${key === "=" ? "col-span-2 bg-black text-white" : "bg-white"}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {tab === "settings" && (
              <section className="mt-5 space-y-5">
                <label className="block font-semibold">
                  Font size
                  <select
                    value={fontSize}
                    onChange={(event) =>
                      saveSettings(event.target.value, contrast)
                    }
                    className="input"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra large</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={contrast}
                    onChange={(event) =>
                      saveSettings(fontSize, event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                  High contrast
                </label>
                <button
                  onClick={() => {
                    localStorage.removeItem("player-tutorial-complete");
                    setTab("tutorial");
                  }}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 font-semibold"
                >
                  Replay tutorial
                </button>
              </section>
            )}
            {tab === "library" && (
              <section className="mt-5">
                <div className="flex gap-2">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    maxLength={100}
                    placeholder="Search published entries"
                    className="input mt-0"
                  />
                  <button
                    onClick={() => void searchLibrary()}
                    className="min-h-11 rounded-none bg-black px-4 font-bold text-white"
                  >
                    Search
                  </button>
                </div>
                {loading && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <LoadingSpinner size="sm" label="Searching library" />
                    Searching…
                  </p>
                )}
                <div className="mt-4 space-y-3">
                  {entries.map((entry) => (
                    <details
                      key={entry.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <summary className="cursor-pointer font-bold">
                        {entry.title}
                      </summary>
                      <p className="mt-2 text-sm text-slate-600">
                        {entry.summary}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap leading-7">
                        {entry.content}
                      </p>
                    </details>
                  ))}
                  {!loading && entries.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No published library entries found. Library content is
                      educational and not medical advice.
                    </p>
                  )}
                </div>
              </section>
            )}
            {tab === "tutorial" && (
              <section className="mt-5">
                <h3 className="text-lg font-bold">Question player tour</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
                  <li>Select an option, then submit or save it.</li>
                  <li>Use Mark to keep a durable question bookmark.</li>
                  <li>Move with Previous, Next, or the navigator grid.</li>
                  <li>
                    The timed-mode clock is server-derived and survives refresh.
                  </li>
                  <li>Notes are private and saved against the question.</li>
                  <li>
                    Tools contains this calculator, settings, and the medical
                    library.
                  </li>
                  <li>
                    Suspend pauses effective timed progress; End finalises the
                    block.
                  </li>
                </ol>
                <p className="mt-4 text-sm text-slate-500">
                  If a control is unavailable, continue the tour; it never traps
                  focus on a missing target.
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={finishTutorial}
                    className="min-h-11 rounded-none bg-black px-5 font-bold text-white"
                  >
                    Finish tour
                  </button>
                  <button
                    onClick={finishTutorial}
                    className="min-h-11 px-4 font-semibold"
                  >
                    Skip
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
