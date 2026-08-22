import Link from "next/link";
import type { ResidencyDirectoryRow } from "@/lib/residencies/directory";

export function ResidencyDirectoryTable({
  rows,
  compact = false,
  startIndex = 0,
  viewBasePath = "/resources/residency-directory",
}: {
  rows: ResidencyDirectoryRow[];
  compact?: boolean;
  startIndex?: number;
  viewBasePath?: string;
}) {
  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="bg-slate-950 text-xs uppercase tracking-wider text-white">
          <tr>
            <th scope="col" className="w-14 px-4 py-4 text-center font-bold">
              S/N
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Program
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Specialty
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Location
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Training snapshot
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Visa information
            </th>
            {!compact && (
              <>
                <th scope="col" className="px-4 py-4 font-bold">
                  Application
                </th>
                <th scope="col" className="px-4 py-4 font-bold">
                  <span className="sr-only">Actions</span>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((residency, index) => (
            <tr key={residency.id} className="align-top hover:bg-brand-50/50">
              <td className="px-4 py-4 text-center font-bold text-slate-500">
                {startIndex + index + 1}
              </td>
              <td className="max-w-[20rem] px-4 py-4">
                <p className="font-bold leading-5 text-slate-950">
                  {residency.program_name ?? "Program name not listed"}
                </p>
                {residency.acgme_id && (
                  <p className="mt-1 text-xs text-slate-500">
                    ACGME ID {residency.acgme_id}
                  </p>
                )}
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">
                  {residency.specialty}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {residency.program_setting ?? "Setting not listed"}
                </p>
              </td>
              <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                {residency.city}, {residency.state}
              </td>
              <td className="px-4 py-4 text-slate-700">
                <p>
                  {residency.program_length_years
                    ? `${residency.program_length_years} years`
                    : "Length not listed"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {residency.first_year_positions ?? "—"} first-year positions
                  {residency.program_size
                    ? ` · ${residency.program_size} total`
                    : ""}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  <VisaBadge label="J-1" value={residency.j1_sponsorship} />
                  <VisaBadge label="H-1B" value={residency.h1b_sponsorship} />
                </div>
                {!residency.visa_filter_ready && (
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    Manual verification needed
                  </p>
                )}
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-slate-700">
                      {residency.application_service ?? "Service not listed"}
                    </p>
                    <ApplicationStatus
                      value={residency.accepting_applications}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`${viewBasePath}/${residency.id}`}
                      className="button-primary min-h-10 px-5 py-2 text-xs"
                      aria-label={`View details for ${residency.program_name ?? "this residency program"}`}
                    >
                      View
                    </Link>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationStatus({ value }: { value: boolean | null }) {
  return (
    <span
      className={`mt-2 inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
        value === true
          ? "bg-emerald-100 text-emerald-800"
          : value === false
            ? "bg-slate-100 text-slate-600"
            : "bg-amber-100 text-amber-900"
      }`}
    >
      {value === true
        ? "Accepting applications"
        : value === false
          ? "Not currently listed as accepting"
          : "Application status needs verification"}
    </span>
  );
}

function VisaBadge({ label, value }: { label: string; value: string | null }) {
  const normalized = value?.trim().toLowerCase();
  const isListed = normalized === "yes";
  const isNotListed = normalized === "no";
  return (
    <span
      title={value ?? "Not provided"}
      className={`inline-flex px-2 py-1 text-[11px] font-bold ${
        isListed
          ? "bg-emerald-100 text-emerald-800"
          : isNotListed
            ? "bg-slate-100 text-slate-600"
            : "bg-amber-100 text-amber-900"
      }`}
    >
      {label}: {isListed ? "listed" : isNotListed ? "not listed" : "verify"}
    </span>
  );
}
