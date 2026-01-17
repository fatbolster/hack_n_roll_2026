"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

type AlignmentStatus = "aligned" | "need_review" | "out_of_scope";

type PaperItem = {
  id: string | number;
  questionNo: number;
  topic: string;
  status: AlignmentStatus;
  confidence: number;
  elaboration?: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  refreshToken?: number;
};

type SummaryCounts = {
  total: number;
  aligned: number;
  needReview: number;
  outOfScope: number;
};

type ConfidenceLevel = "high" | "medium" | "low";

const statusStyles: Record<
  AlignmentStatus,
  { label: string; pillClass: string; icon: JSX.Element }
> = {
  aligned: {
    label: "Aligned",
    pillClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    icon: <CheckIcon className="h-4 w-4" />,
  },
  need_review: {
    label: "Needs Review",
    pillClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    icon: <AlertIcon className="h-4 w-4" />,
  },
  out_of_scope: {
    label: "Out of Syllabus",
    pillClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    icon: <BlockIcon className="h-4 w-4" />,
  },
};

const confidenceStyles: Record<ConfidenceLevel, { label: string; pillClass: string }> = {
  high: {
    label: "High",
    pillClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  },
  medium: {
    label: "Medium",
    pillClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  },
  low: {
    label: "Low",
    pillClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  },
};

const palette = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#8b5cf6", "#22c55e", "#fb7185"];

export function PaperAlignmentModal({ isOpen, onClose, refreshToken = 0 }: ModalProps) {
  const [items, setItems] = useState<PaperItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadAnalysis() {
      try {
        // Add cache-busting query so every Analyze click re-imports the data file.
        const data = await import(`./database.json?refresh=${refreshToken}`);
        const raw = (data.default as any) ?? {};
        const sourceArray = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.paper_analysis)
            ? raw.paper_analysis
            : Array.isArray(raw.report?.paper_analysis)
              ? raw.report.paper_analysis
              : [];

        const parsed: PaperItem[] = sourceArray
          .map((entry: any, index: number) => {
            const status: AlignmentStatus | undefined = entry?.status;
            if (status !== "aligned" && status !== "need_review" && status !== "out_of_scope") {
              return null;
            }

            const questionNoRaw = Number(entry?.question_no ?? index + 1);
            const confidenceValue = parseFloat(entry?.confidence ?? entry?.score ?? "0");

            return {
              id: entry?.id ?? index,
              questionNo: Number.isFinite(questionNoRaw) ? questionNoRaw : index + 1,
              topic: entry?.topic ?? `Question ${index + 1}`,
              status,
              confidence: Number.isFinite(confidenceValue) ? Math.max(0, Math.min(1, confidenceValue)) : 0,
              elaboration: entry?.elaboration ?? entry?.notes ?? "",
            };
          })
          .filter(Boolean) as PaperItem[];

        if (isMounted) {
          setItems(parsed);
        }
      } catch (error) {
        console.error("Failed to load paper alignment data", error);
        if (isMounted) {
          setItems([]);
        }
      }
    }

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [isOpen, refreshToken]);

  const summary = useMemo<SummaryCounts>(() => {
    if (!items.length) {
      return { total: 0, aligned: 0, needReview: 0, outOfScope: 0 };
    }

    return items.reduce<SummaryCounts>(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "aligned") acc.aligned += 1;
        if (item.status === "need_review") acc.needReview += 1;
        if (item.status === "out_of_scope") acc.outOfScope += 1;
        return acc;
      },
      { total: 0, aligned: 0, needReview: 0, outOfScope: 0 },
    );
  }, [items]);

  const coverageData = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const topic = item.topic ?? "Unknown";
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: palette[index % palette.length],
    }));
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="mt-10 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Analysis Results</p>
          <p className="text-lg font-semibold text-slate-900">Paper Alignment Summary</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 border-b border-slate-100 px-6 py-4 sm:grid-cols-3">
        <SummaryCard
          label="Aligned"
          value={summary.aligned}
          icon={<CheckIcon className="h-5 w-5 text-emerald-600" />}
          className="text-emerald-700"
        />
        <SummaryCard
          label="Needs Review"
          value={summary.needReview}
          icon={<AlertIcon className="h-5 w-5 text-amber-600" />}
          className="text-amber-700"
        />
        <SummaryCard
          label="Out of Syllabus"
          value={summary.outOfScope}
          icon={<BlockIcon className="h-5 w-5 text-rose-600" />}
          className="text-rose-700"
        />
      </div>

      <div className="px-6 py-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Question Analysis</p>
              <p className="text-xs font-medium text-slate-500">
                <span className="text-xs font-medium text-slate-500">{summary.total}</span> questions analyzed
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">No analysis data found.</div>
              ) : (
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-16" />
                    <col />
                    <col className="w-32" />
                    <col className="w-40" />
                    <col className="w-12" />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-300 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      <th scope="col" className="px-4 py-3 text-left">Q#</th>
                      <th scope="col" className="px-4 py-3 text-left">Topic</th>
                      <th scope="col" className="px-4 py-3 text-center">Confidence</th>
                      <th scope="col" className="px-4 py-3 text-center">Status</th>
                      <th scope="col" className="px-4 py-3 text-center">
                        <span className="sr-only">Toggle</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-900">
                    {items.map((item, rowIndex) => {
                      const confidenceLevel = getConfidenceLevel(item.confidence);
                      const key = String(item.id);
                      const isExpanded = expanded[key] === true;
                      const hasDetails = Boolean(item.elaboration);
                      const rowBgClass = rowIndex % 2 === 0 ? "" : "bg-slate-100";
                      return (
                        <Fragment key={item.id}>
                          <tr className={`${rowBgClass} transition hover:bg-slate-50`}>
                            <td className="border-b border-slate-100 px-4 py-3 align-middle">
                              <div className="text-sm font-semibold text-slate-800">{item.questionNo}</div>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 align-middle">
                              <span className="font-medium text-base text-slate-900 truncate">{item.topic}</span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-center align-middle">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${confidenceStyles[confidenceLevel].pillClass}`}>
                                {confidenceStyles[confidenceLevel].label}
                              </span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-center align-middle">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusStyles[item.status].pillClass}`}
                              >
                                {statusStyles[item.status].icon}
                                {statusStyles[item.status].label}
                              </span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3 text-center align-middle">
                              <button
                                type="button"
                                disabled={!hasDetails}
                                className={`rounded-full p-[0.3rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${hasDetails ? "group cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-600" : "cursor-default text-slate-200"}`}
                                onClick={() =>
                                  hasDetails
                                    ? setExpanded((prev) => ({
                                        ...prev,
                                        [key]: !prev[key],
                                      }))
                                    : undefined
                                }
                                aria-label={isExpanded ? "Hide details" : "Show details"}
                              >
                                <ChevronIcon
                                  className={`h-[1.2rem] w-[1.2rem] transition ${isExpanded ? "rotate-180" : ""} ${
                                    hasDetails ? "group-hover:scale-[1.2]" : ""
                                  }`}
                                />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && hasDetails ? (
                            <tr className={`${rowBgClass} transition hover:bg-slate-50`}>
                              <td colSpan={5} className="border-b border-slate-100 px-4 pb-4 text-xs text-slate-600">
                                <div className="flex gap-4">
                                  <div className="h-9 w-9" />
                                  <div className="flex-1 leading-relaxed">{item.elaboration}</div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Topic Coverage</p>
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100">
              <div className="h-64 w-full px-4 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={coverageData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {coverageData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      offset={0}
                      formatter={(value: number | string) => {
                        const numericValue = typeof value === "number" ? value : Number(value);
                        const percentage = summary.total ? Math.round((numericValue / summary.total) * 1000) / 10 : 0;
                        return [`${percentage}%`];
                      }}
                      separator=" "
                      labelFormatter={() => ""}
                      contentStyle={{ borderRadius: 12, padding: "6px 8px" }}
                      itemStyle={{ fontSize: "12px" }}
                      labelStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="divide-y divide-slate-100">
                {coverageData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between px-4 py-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
      value,
      icon,
      className,
}: {
  label: string;
  value: number;
  icon: JSX.Element;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-semibold text-slate-700 ring-1 ring-slate-100">
        {value}
      </div>
      <div>
        <p className={`text-sm font-semibold ${className}`}>{label}</p>
      </div>
      <span className="ml-auto">{icon}</span>
    </div>
  );
}

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score < 0.3) return "low";
  if (score < 0.7) return "medium";
  return "high";
}

type IconProps = SVGProps<SVGSVGElement>;

function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m7 7 10 10M17 7 7 17" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M5.5 12.5 10 17l8.5-10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 8v4m0 4h.01M4.5 19h15L12 4.5 4.5 19Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BlockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
      <path d="m8 8 8 8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m7 10 5 5 5-5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
