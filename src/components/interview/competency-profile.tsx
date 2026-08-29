import { getInterviewPracticeArea } from "@/lib/interview/questions";
import { scoreToPercentage } from "@/lib/interview/scoring";

export function CompetencyProfile({
  items,
}: {
  items: Array<{
    competency_id: string;
    score: number;
    questions_assessed: number;
  }>;
}) {
  if (!items.length)
    return (
      <p className="text-sm text-slate-600">
        No competencies have been sufficiently assessed yet.
      </p>
    );
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const label =
          getInterviewPracticeArea(item.competency_id)?.title ??
          item.competency_id;
        const percentage = scoreToPercentage(Number(item.score));
        return (
          <div key={item.competency_id}>
            <div className="flex items-end justify-between gap-3 text-sm">
              <p className="font-bold text-slate-900">{label}</p>
              <p className="text-right text-slate-600">
                {Number(item.score).toFixed(1)}/5 · {item.questions_assessed}{" "}
                assessed
              </p>
            </div>
            <div
              className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${label}: ${Number(item.score).toFixed(1)} out of 5`}
            >
              <div
                className="h-full rounded-full bg-blue-800"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
