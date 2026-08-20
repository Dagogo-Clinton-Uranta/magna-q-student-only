"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { enabledSystemIdsForSubjects } from "@/lib/study/taxonomy-selection";

type Exam = { id: string; name: string };
type Subject = { id: string; exam_id: string; name: string };
type System = { id: string; exam_id: string; name: string };
type Mapping = { subject_id: string; category_id: string };
type Usage = "unused" | "incorrect" | "marked" | "correct";

const usageOptions: Array<{
  value: Usage;
  label: string;
  description: string;
}> = [
  {
    value: "unused",
    label: "Unused",
    description: "Questions you have not answered before.",
  },
  {
    value: "incorrect",
    label: "Incorrect",
    description: "Questions your latest attempt got wrong.",
  },
  {
    value: "marked",
    label: "Marked",
    description: "Questions you saved for another look.",
  },
  {
    value: "correct",
    label: "Correct",
    description: "Questions your latest attempt got right.",
  },
];

export function BlockBuilder({
  exam,
  subjects,
  categories: systems,
  mappings,
  subjectCounts,
  systemCounts,
}: {
  exam: Exam;
  subjects: Subject[];
  categories: System[];
  mappings: Mapping[];
  subjectCounts: Record<string, number>;
  systemCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"tutor" | "timed">("tutor");
  const [usages, setUsages] = useState<Usage[]>(["unused"]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [systemIds, setSystemIds] = useState<string[]>([]);
  const [eligible, setEligible] = useState(0);
  const [countState, setCountState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [requested, setRequested] = useState(10);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const enabledSystemIds = useMemo(
    () => enabledSystemIdsForSubjects(subjectIds, mappings),
    [mappings, subjectIds],
  );
  const enabledSystems = useMemo(
    () => systems.filter((system) => enabledSystemIds.has(system.id)),
    [enabledSystemIds, systems],
  );

  useEffect(() => {
    setSystemIds((current) => current.filter((id) => enabledSystemIds.has(id)));
  }, [enabledSystemIds]);

  useEffect(() => {
    if (subjectIds.length === 0 || usages.length === 0) {
      setEligible(0);
      setCountState("idle");
      return;
    }
    const controller = new AbortController();
    setCountState("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/study/eligible-count", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            mode,
            usages,
            subjectIds,
            categoryIds: systemIds,
          }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          count?: number;
          error?: string;
        };
        if (!response.ok || typeof result.count !== "number") throw new Error();
        const availableCount = result.count;
        setEligible(availableCount);
        setRequested((current) =>
          availableCount === 0
            ? 1
            : Math.min(Math.max(1, current), availableCount),
        );
        setCountState("ready");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setCountState("error");
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [exam.id, mode, usages, subjectIds, systemIds]);

  function toggle(values: string[], id: string) {
    return values.includes(id)
      ? values.filter((item) => item !== id)
      : [...values, id];
  }

  async function createTest() {
    if (
      requested < 1 ||
      requested > eligible ||
      usages.length === 0 ||
      subjectIds.length === 0
    )
      return;
    setCreating(true);
    setCreateError("");
    try {
      const response = await fetch("/api/study/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          mode,
          usages,
          subjectIds,
          categoryIds: systemIds,
          requestedCount: requested,
        }),
      });
      const result = (await response.json()) as {
        blockId?: string;
        error?: string;
      };
      if (!response.ok || !result.blockId) {
        setCreateError(result.error ?? "Test creation failed.");
        return;
      }
      router.push(`/study/block/${result.blockId}`);
    } catch {
      setCreateError(
        "Your connection dropped. Check your dashboard before trying again.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <Section title="Choose a mode">
          <div className="grid gap-3 sm:grid-cols-2">
            <RadioCard
              checked={mode === "timed"}
              onChange={() => setMode("timed")}
              label="Timed mode"
              description="Work against a 90-second-per-question countdown. Answers and explanations appear after the test."
            />
            <RadioCard
              checked={mode === "tutor"}
              onChange={() => setMode("tutor")}
              label="Untimed mode"
              description="Practice without a countdown and review the teaching explanation after each answer."
            />
          </div>
        </Section>

        <Section
          title="Question type"
          description="Select one or more. Questions matching any selected type are included."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {usageOptions.map((option) => (
              <CheckboxCard
                key={option.value}
                checked={usages.includes(option.value)}
                onChange={() =>
                  setUsages(
                    toggle(usages, option.value).filter(
                      (value): value is Usage =>
                        usageOptions.some((item) => item.value === value),
                    ),
                  )
                }
                label={option.label}
                detail={option.description}
              />
            ))}
          </div>
          {usages.length === 0 && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              Select at least one question type.
            </p>
          )}
        </Section>

        <Section title="Subjects">
          <SelectionButtons
            onAll={() => setSubjectIds(subjects.map((item) => item.id))}
            onClear={() => {
              setSubjectIds([]);
              setSystemIds([]);
            }}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {subjects.map((subject) => (
              <CheckboxCard
                key={subject.id}
                checked={subjectIds.includes(subject.id)}
                onChange={() => setSubjectIds(toggle(subjectIds, subject.id))}
                label={subject.name}
                count={subjectCounts[subject.id] ?? 0}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Systems"
          description="Choose subjects first. Leave every enabled system unchecked to include all systems within those subjects."
          disabled={subjectIds.length === 0}
        >
          <SelectionButtons
            disabled={subjectIds.length === 0}
            onAll={() =>
              setSystemIds(enabledSystems.map((system) => system.id))
            }
            onClear={() => setSystemIds([])}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {enabledSystems.map((system) => (
              <CheckboxCard
                key={system.id}
                checked={systemIds.includes(system.id)}
                onChange={() => setSystemIds(toggle(systemIds, system.id))}
                label={system.name}
                count={systemCounts[system.id] ?? 0}
              />
            ))}
            {subjectIds.length > 0 && enabledSystems.length === 0 && (
              <p className="text-sm text-muted">
                No systems are mapped to the selected subjects.
              </p>
            )}
          </div>
        </Section>

        <Section title="Number of questions">
          <div
            aria-live="polite"
            className="border border-brand-200 bg-soft p-4 font-semibold text-body"
          >
            {countState === "loading" && (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" label="Updating question count" />
                Updating available questions…
              </span>
            )}
            {countState === "error" &&
              "The available question count could not be loaded. Change a filter to retry."}
            {countState === "idle" &&
              (usages.length === 0
                ? "Select at least one question type."
                : "Select at least one subject.")}
            {countState === "ready" &&
              `${eligible} question${eligible === 1 ? "" : "s"} available for these choices`}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[5, 10, 20, 40].map((value) => (
              <button
                key={value}
                type="button"
                disabled={value > eligible}
                onClick={() => setRequested(value)}
                className={`min-h-11 border px-4 font-normal disabled:cursor-not-allowed disabled:opacity-40 ${
                  requested === value
                    ? "border-black bg-black text-white"
                    : "border-line"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <label className="mt-4 block max-w-xs text-sm font-semibold">
            Questions in this test
            <input
              type="number"
              min={1}
              max={Math.max(1, eligible)}
              value={requested}
              onChange={(event) => setRequested(Number(event.target.value))}
              className="input"
            />
          </label>
          <p className="mt-3 text-sm text-muted">
            The requested number will be selected at random from the available
            questions and saved as a fixed test.
          </p>
          {createError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900"
            >
              {createError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void createTest()}
            disabled={
              creating ||
              countState !== "ready" ||
              eligible === 0 ||
              usages.length === 0 ||
              subjectIds.length === 0 ||
              requested < 1 ||
              requested > eligible
            }
            className="button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" label="Creating test" />
                Creating test…
              </span>
            ) : (
              "Create test"
            )}
          </button>
        </Section>
      </div>

      <aside className="h-fit border border-line bg-white p-5 lg:sticky lg:top-6">
        <p className="eyebrow">{exam.name}</p>
        <h2 className="mt-2 text-lg font-normal tracking-[0.02em]">
          Test summary
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Summary
            label="Mode"
            value={mode === "tutor" ? "Untimed" : "Timed"}
          />
          <Summary label="Question types" value={String(usages.length)} />
          <Summary label="Subjects" value={String(subjectIds.length)} />
          <Summary
            label="Systems"
            value={systemIds.length ? String(systemIds.length) : "All selected"}
          />
          <Summary label="Questions" value={String(requested)} />
          {mode === "timed" && (
            <Summary
              label="Time limit"
              value={`${Math.ceil(requested * 1.5)} minutes`}
            />
          )}
        </dl>
      </aside>
    </div>
  );
}

function Section({
  title,
  description,
  disabled = false,
  children,
}: {
  title: string;
  description?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`border bg-white p-5 ${
        disabled ? "border-line bg-field text-muted" : "border-line"
      }`}
    >
      <h2 className="text-lg font-normal tracking-[0.02em]">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RadioCard({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <label
      className={`flex min-h-28 cursor-pointer gap-3 border p-4 transition ${
        checked
          ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
          : "border-line hover:border-brand-300"
      }`}
    >
      <input
        type="radio"
        name="test-mode"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0"
      />
      <span>
        <strong className="block">{label}</strong>
        <span className="mt-1 block text-sm text-muted">{description}</span>
      </span>
    </label>
  );
}

function CheckboxCard({
  checked,
  onChange,
  label,
  detail,
  count,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  detail?: string;
  count?: number;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex min-h-14 gap-3 border p-3 transition ${
        disabled
          ? "cursor-not-allowed border-line bg-field text-placeholder"
          : checked
            ? "cursor-pointer border-brand-600 bg-brand-50"
            : "cursor-pointer border-line hover:border-brand-300"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <strong className="text-sm">{label}</strong>
          {count !== undefined && <CountBadge count={count} />}
        </span>
        {detail && (
          <span className="mt-1 block text-xs text-muted">{detail}</span>
        )}
      </span>
    </label>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
      title={`${count} live questions`}
      aria-label={`${count} live questions`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
      >
        <path
          d="M6 3.5h6.5L16 7v9.5H6v-13Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8.5 10h5M8.5 13h5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {count.toLocaleString()}
    </span>
  );
}

function SelectionButtons({
  onAll,
  onClear,
  disabled = false,
}: {
  onAll: () => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={onAll}
        className="min-h-11 text-sm font-semibold text-brand-700 disabled:text-placeholder"
      >
        Select all
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        className="min-h-11 text-sm font-semibold text-muted disabled:text-placeholder"
      >
        Clear all
      </button>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
