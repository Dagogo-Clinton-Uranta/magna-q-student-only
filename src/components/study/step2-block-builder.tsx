"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Usage = "unused" | "incorrect" | "marked" | "correct";
type Difficulty = "easy" | "medium" | "hard";
type NutritionFilter = "all" | "only" | "exclude";
type TaxonomyItem = {
  id: string;
  code: string;
  name: string;
  count: number;
  officialAxis?: boolean;
};
type Topic = { key: string; name: string; systemId: string; count: number };

export type Step2BuilderMap = {
  systems: TaxonomyItem[];
  clinicalSciences: TaxonomyItem[];
  competencies: TaxonomyItem[];
  topics: Topic[];
  nutritionCount: number;
};

export type Step1BuilderMap = {
  systems: TaxonomyItem[];
  disciplines: TaxonomyItem[];
  competencies: TaxonomyItem[];
  topics: Topic[];
};

const usageOptions: Array<[Usage, string, string]> = [
  ["unused", "Unused", "Questions you have not answered before."],
  ["incorrect", "Incorrect", "Questions your latest attempt got wrong."],
  ["marked", "Marked", "Questions you saved for another look."],
  ["correct", "Correct", "Questions your latest attempt got right."],
];

const difficultyOptions: Array<[Difficulty, string]> = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
];

export function Step2BlockBuilder({
  exam,
  selectionMap,
}: {
  exam: { id: string; name: string };
  selectionMap: Step2BuilderMap;
}) {
  return (
    <ExamBlueprintBlockBuilder
      exam={exam}
      selectionMap={selectionMap}
      examKind="step2"
    />
  );
}

export function Step1BlockBuilder({
  exam,
  selectionMap,
}: {
  exam: { id: string; name: string };
  selectionMap: Step1BuilderMap;
}) {
  return (
    <ExamBlueprintBlockBuilder
      exam={exam}
      examKind="step1"
      selectionMap={{
        systems: selectionMap.systems,
        clinicalSciences: selectionMap.disciplines,
        competencies: selectionMap.competencies,
        topics: selectionMap.topics,
        nutritionCount: 0,
      }}
    />
  );
}

function ExamBlueprintBlockBuilder({
  exam,
  selectionMap,
  examKind,
}: {
  exam: { id: string; name: string };
  selectionMap: Step2BuilderMap;
  examKind: "step1" | "step2";
}) {
  const router = useRouter();
  const availableSystemIds = useMemo(
    () =>
      selectionMap.systems
        .filter((item) => item.count > 0)
        .map((item) => item.id),
    [selectionMap.systems],
  );
  const [mode, setMode] = useState<"tutor" | "timed">("tutor");
  const [usages, setUsages] = useState<Usage[]>(["unused"]);
  const [systemIds, setSystemIds] = useState<string[]>(availableSystemIds);
  const [clinicalScienceIds, setClinicalScienceIds] = useState<string[]>([]);
  const [competencyIds, setCompetencyIds] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [nutritionFilter, setNutritionFilter] =
    useState<NutritionFilter>("all");
  const [topicSearch, setTopicSearch] = useState("");
  const [eligible, setEligible] = useState(0);
  const [countState, setCountState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [requested, setRequested] = useState(10);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const visibleTopics = useMemo(() => {
    const query = topicSearch.trim().toLocaleLowerCase();
    return selectionMap.topics.filter(
      (topic) =>
        systemIds.includes(topic.systemId) &&
        (!query || topic.name.toLocaleLowerCase().includes(query)),
    );
  }, [selectionMap.topics, systemIds, topicSearch]);

  useEffect(() => {
    const permitted = new Set(
      selectionMap.topics
        .filter((topic) => systemIds.includes(topic.systemId))
        .map((topic) => topic.key),
    );
    setTopics((current) => current.filter((topic) => permitted.has(topic)));
  }, [selectionMap.topics, systemIds]);

  useEffect(() => {
    if (systemIds.length === 0 || usages.length === 0) {
      setEligible(0);
      setCountState("idle");
      return;
    }
    const controller = new AbortController();
    setCountState("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/study/${examKind}/eligible-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            mode,
            usages,
            systemIds,
            ...(examKind === "step1"
              ? { disciplineIds: clinicalScienceIds }
              : { clinicalScienceIds }),
            competencyIds,
            topics,
            difficulties,
            ...(examKind === "step2" ? { nutritionFilter } : {}),
          }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          count?: number;
          error?: string;
        };
        if (!response.ok || typeof result.count !== "number")
          throw new Error(result.error);
        // Capture the narrowed value before entering the state updater. TypeScript
        // does not retain a property narrowing inside that callback.
        const eligibleCount = result.count;
        setEligible(eligibleCount);
        setRequested((current) =>
          eligibleCount === 0 ? 1 : Math.min(current, eligibleCount, 20),
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
  }, [
    clinicalScienceIds,
    competencyIds,
    difficulties,
    exam.id,
    examKind,
    mode,
    nutritionFilter,
    systemIds,
    topics,
    usages,
  ]);

  function toggle<T extends string>(values: T[], value: T) {
    return values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
  }

  async function createTest() {
    if (
      requested < 1 ||
      requested > Math.min(eligible, 20) ||
      usages.length === 0 ||
      systemIds.length === 0
    )
      return;
    setCreating(true);
    setCreateError("");
    try {
      const response = await fetch(`/api/study/${examKind}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          mode,
          usages,
          systemIds,
          ...(examKind === "step1"
            ? { disciplineIds: clinicalScienceIds }
            : { clinicalScienceIds }),
          competencyIds,
          topics,
          difficulties,
          ...(examKind === "step2" ? { nutritionFilter } : {}),
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
        <Section
          title="Practice mode"
          description={
            examKind === "step1"
              ? "The current Step 1 format uses 30-minute blocks of up to 20 questions."
              : "The current Step 2 CK format uses 30-minute blocks of up to 20 questions."
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <RadioCard
              name="mode"
              checked={mode === "timed"}
              onChange={() => setMode("timed")}
              label="Timed"
              detail="90 seconds per question; explanations appear after the test."
            />
            <RadioCard
              name="mode"
              checked={mode === "tutor"}
              onChange={() => setMode("tutor")}
              label="Tutor"
              detail="Untimed practice with teaching explanations after each answer."
            />
          </div>
        </Section>

        <Section
          title="Question history"
          description="Select one or more. A question can qualify through any selected history state."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {usageOptions.map(([value, label, detail]) => (
              <CheckboxCard
                key={value}
                checked={usages.includes(value)}
                onChange={() => setUsages(toggle(usages, value))}
                label={label}
                detail={detail}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Organ system"
          description={`Every ${examKind === "step1" ? "Step 1" : "Step 2 CK"} question belongs to exactly one blueprint system. Select one or more.`}
        >
          <SelectionButtons
            onAll={() => setSystemIds(availableSystemIds)}
            onClear={() => setSystemIds([])}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectionMap.systems.map((item) => (
              <CheckboxCard
                key={item.id}
                checked={systemIds.includes(item.id)}
                onChange={() => setSystemIds(toggle(systemIds, item.id))}
                label={item.name}
                code={item.code}
                count={item.count}
                disabled={item.count === 0}
              />
            ))}
          </div>
          {systemIds.length === 0 && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              Select at least one system.
            </p>
          )}
        </Section>

        <Section
          title={
            examKind === "step1" ? "Science discipline" : "Clinical science"
          }
          description={
            examKind === "step1"
              ? "Step 1 disciplines are cross-cutting and integrative. Leave all unchecked to include every discipline; multiple selections match any selected tag."
              : "This is an independent, integrative axis. Leave all unchecked to include every clinical science; multiple selections match any selected tag."
          }
        >
          <SelectionButtons
            onAll={() =>
              setClinicalScienceIds(
                selectionMap.clinicalSciences
                  .filter((item) => item.count > 0)
                  .map((item) => item.id),
              )
            }
            onClear={() => setClinicalScienceIds([])}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectionMap.clinicalSciences.map((item) => (
              <CheckboxCard
                key={item.id}
                checked={clinicalScienceIds.includes(item.id)}
                onChange={() =>
                  setClinicalScienceIds(toggle(clinicalScienceIds, item.id))
                }
                label={item.name}
                code={item.code}
                detail={
                  examKind === "step1" && item.officialAxis === false
                    ? "Supporting discipline"
                    : undefined
                }
                count={item.count}
                disabled={item.count === 0}
              />
            ))}
          </div>
        </Section>

        <Section
          title={
            examKind === "step1" ? "Task or competency" : "Patient-care task"
          }
          description={
            examKind === "step1"
              ? "Choose foundational science, diagnosis, history/physical examination, communication, or practice-based learning. Leave all unchecked to include every competency."
              : "Step 2 CK tests what to do for the patient. Leave all unchecked to include every task; selected tasks are combined with your other filters."
          }
        >
          <SelectionButtons
            onAll={() =>
              setCompetencyIds(
                selectionMap.competencies
                  .filter((item) => item.count > 0)
                  .map((item) => item.id),
              )
            }
            onClear={() => setCompetencyIds([])}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectionMap.competencies.map((item) => (
              <CheckboxCard
                key={item.id}
                checked={competencyIds.includes(item.id)}
                onChange={() =>
                  setCompetencyIds(toggle(competencyIds, item.id))
                }
                label={
                  examKind === "step2"
                    ? item.name.replace(/^Patient Care:\s*/, "")
                    : item.name
                }
                count={item.count}
                disabled={item.count === 0}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Topic"
          description="Optional. Topics are shown only for the selected systems and match any checked topic."
          disabled={systemIds.length === 0}
        >
          <input
            type="search"
            value={topicSearch}
            onChange={(event) => setTopicSearch(event.target.value)}
            placeholder={`Find a ${examKind === "step1" ? "Step 1" : "Step 2 CK"} topic`}
            disabled={systemIds.length === 0}
            className="input max-w-xl"
          />
          <SelectionButtons
            disabled={systemIds.length === 0}
            onAll={() => setTopics(visibleTopics.map((topic) => topic.key))}
            onClear={() => setTopics([])}
          />
          <div className="mt-3 max-h-96 overflow-y-auto border border-line p-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleTopics.map((topic) => (
                <CheckboxCard
                  key={`${topic.systemId}:${topic.name}`}
                  checked={topics.includes(topic.key)}
                  onChange={() => setTopics(toggle(topics, topic.key))}
                  label={topic.name}
                  count={topic.count}
                />
              ))}
            </div>
            {systemIds.length > 0 && visibleTopics.length === 0 && (
              <p className="p-3 text-sm text-muted">
                No live topics match this search.
              </p>
            )}
          </div>
        </Section>

        {examKind === "step2" && (
          <Section
            title="Nutrition focus"
            description="Nutrition is a cross-cutting Step 2 CK tag, not an organ system."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <RadioCard
                name="nutrition"
                checked={nutritionFilter === "all"}
                onChange={() => setNutritionFilter("all")}
                label="Include either"
                detail="Do not filter by nutrition."
              />
              <RadioCard
                name="nutrition"
                checked={nutritionFilter === "only"}
                onChange={() => setNutritionFilter("only")}
                label="Nutrition only"
                detail={`${selectionMap.nutritionCount} live nutrition-tagged questions.`}
              />
              <RadioCard
                name="nutrition"
                checked={nutritionFilter === "exclude"}
                onChange={() => setNutritionFilter("exclude")}
                label="Exclude nutrition"
                detail="Omit nutrition-tagged questions."
              />
            </div>
          </Section>
        )}

        <Section
          title="Difficulty"
          description="Optional. Leave all unchecked for a mixed-difficulty block."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {difficultyOptions.map(([value, label]) => (
              <CheckboxCard
                key={value}
                checked={difficulties.includes(value)}
                onChange={() => setDifficulties(toggle(difficulties, value))}
                label={label}
              />
            ))}
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
                ? "Select at least one question-history state."
                : "Select at least one system.")}
            {countState === "ready" &&
              `${eligible} question${eligible === 1 ? "" : "s"} available for this selection`}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((value) => (
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
            Questions in this block (maximum 20)
            <input
              type="number"
              min={1}
              max={Math.max(1, Math.min(20, eligible))}
              value={requested}
              onChange={(event) => setRequested(Number(event.target.value))}
              className="input"
            />
          </label>
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
              systemIds.length === 0 ||
              requested < 1 ||
              requested > Math.min(eligible, 20)
            }
            className="button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" label="Creating test" />
                Creating test…
              </span>
            ) : (
              `Create ${examKind === "step1" ? "Step 1" : "Step 2 CK"} test`
            )}
          </button>
        </Section>
      </div>

      <aside className="h-fit border border-line bg-white p-5 lg:sticky lg:top-6">
        <p className="eyebrow">{exam.name}</p>
        <h2 className="mt-2 text-lg font-normal tracking-[0.02em]">
          Selection map
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Summary label="Mode" value={mode === "tutor" ? "Tutor" : "Timed"} />
          <Summary label="Systems" value={String(systemIds.length)} />
          <Summary
            label={
              examKind === "step1" ? "Science disciplines" : "Clinical sciences"
            }
            value={
              clinicalScienceIds.length
                ? String(clinicalScienceIds.length)
                : "All"
            }
          />
          <Summary
            label={examKind === "step1" ? "Competencies" : "Patient-care tasks"}
            value={competencyIds.length ? String(competencyIds.length) : "All"}
          />
          <Summary
            label="Topics"
            value={topics.length ? String(topics.length) : "All"}
          />
          <Summary
            label="Difficulty"
            value={difficulties.length ? difficulties.join(", ") : "Mixed"}
          />
          {examKind === "step2" && (
            <Summary
              label="Nutrition"
              value={
                nutritionFilter === "all"
                  ? "Either"
                  : nutritionFilter === "only"
                    ? "Only"
                    : "Excluded"
              }
            />
          )}
          <Summary label="Questions" value={String(requested)} />
          {mode === "timed" && (
            <Summary
              label="Time limit"
              value={`${Math.ceil(requested * 1.5)} minutes`}
            />
          )}
        </dl>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">
          Filters across axes are combined. Multiple choices within an axis
          match any selected value.
        </p>
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
      className={`border p-5 ${disabled ? "border-line bg-field text-muted" : "border-line bg-white"}`}
    >
      <h2 className="text-lg font-normal tracking-[0.02em]">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CheckboxCard({
  checked,
  onChange,
  label,
  detail,
  code,
  count,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  detail?: string;
  code?: string;
  count?: number;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex min-h-14 gap-3 border p-3 ${disabled ? "cursor-not-allowed border-line bg-field text-placeholder" : checked ? "cursor-pointer border-brand-600 bg-brand-50" : "cursor-pointer border-line hover:border-brand-300"}`}
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
        {(code || detail) && (
          <span className="mt-1 block text-xs text-muted">
            {code && <span className="mr-2 font-bold">{code}</span>}
            {detail}
          </span>
        )}
      </span>
    </label>
  );
}

function RadioCard({
  name,
  checked,
  onChange,
  label,
  detail,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  detail: string;
}) {
  return (
    <label
      className={`flex min-h-24 cursor-pointer gap-3 border p-4 ${checked ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line hover:border-brand-300"}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0"
      />
      <span>
        <strong className="block">{label}</strong>
        <span className="mt-1 block text-sm text-muted">{detail}</span>
      </span>
    </label>
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

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
      title={`${count} live questions`}
    >
      {count.toLocaleString()}
    </span>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold capitalize">{value}</dd>
    </div>
  );
}
