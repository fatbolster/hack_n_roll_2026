"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import { Button } from "../ui/button";

type ChangeStatus = "added" | "removed" | "modified";

type ChangeItem = {
  id?: string | number;
  title: string;
  change_summary: string;
  old_summary?: string;
  new_summary?: string;
  status: ChangeStatus;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  refreshToken?: number;
};

const statusStyles: Record<
  ChangeStatus,
  { label: string; textClass: string; pillClass: string; accentClass: string }
> = {
  added: {
    label: "Added",
    textClass: "text-emerald-600",
    pillClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    accentClass: "bg-emerald-500",
  },
  removed: {
    label: "Removed",
    textClass: "text-rose-600",
    pillClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    accentClass: "bg-rose-500",
  },
  modified: {
    label: "Modified",
    textClass: "text-amber-600",
    pillClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    accentClass: "bg-amber-500",
  },
};

type SummaryCounts = {
  all: number;
  added: number;
  removed: number;
  modified: number;
};

const emptyCounts: SummaryCounts = { all: 0, added: 0, removed: 0, modified: 0 };

export function SyllabusChangesModal({ isOpen, onClose, refreshToken = 0 }: ModalProps) {
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<keyof SummaryCounts>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadChanges() {
      try {
        const data = await import("./database.json");
        const raw = (data.default as any) ?? {};
        const sourceArray = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.changes)
            ? raw.changes
            : Array.isArray(raw.report?.syllabi_diff)
              ? raw.report.syllabi_diff
            : Array.isArray(raw.report?.changes)
              ? raw.report.changes
              : [];

        const parsedChanges: ChangeItem[] = sourceArray
          .map((item, idx) => {
            const status = item?.status;
            if (status !== "added" && status !== "removed" && status !== "modified") {
              return null;
            }
            const title = item?.title ?? item?.topic ?? item?.topic_name ?? `Change ${idx + 1}`;
            const change_summary = item?.change_summary ?? item?.description ?? "";
            const old_summary = item?.old_summary ?? "";
            const new_summary = item?.new_summary ?? "";
            return {
              id: item?.id ?? idx,
              status,
              title,
              change_summary,
              old_summary,
              new_summary,
            };
          })
          .filter(Boolean) as ChangeItem[];

        if (isMounted) {
          setChanges(parsedChanges);
          setActiveFilter("all");
          setExpanded({});
        }
      } catch (error) {
        console.error("Failed to load syllabus changes", error);
        if (isMounted) {
          setChanges([]);
        }
      }
    }

    loadChanges();

    return () => {
      isMounted = false;
    };
  }, [isOpen, refreshToken]);

  const counts = useMemo(() => {
    if (!changes.length) return emptyCounts;

    return changes.reduce<SummaryCounts>(
      (acc, change) => {
        acc.all += 1;
        if (change.status === "added") acc.added += 1;
        if (change.status === "removed") acc.removed += 1;
        if (change.status === "modified") acc.modified += 1;
        return acc;
      },
      { ...emptyCounts },
    );
  }, [changes]);

  const filteredChanges =
    activeFilter === "all"
      ? [...changes].sort(
          (a, b) =>
            (a.status === "added" ? 0 : a.status === "removed" ? 1 : 2) -
            (b.status === "added" ? 0 : b.status === "removed" ? 1 : 2),
        )
      : changes
          .filter((change) => change.status === activeFilter)
          .sort(
            (a, b) =>
              (a.status === "added" ? 0 : a.status === "removed" ? 1 : 2) -
              (b.status === "added" ? 0 : b.status === "removed" ? 1 : 2),
          );

  if (!isOpen) return null;

  return (
    <div className="mt-10 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Analysis Results</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="text-slate-900">All ({counts.all})</span>
            <span className="text-emerald-600">+ {counts.added} Added</span>
            <span className="text-rose-600">- {counts.removed} Removed</span>
            <span className="text-amber-600">• {counts.modified} Modified</span>
          </div>
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

      <div className="border-b border-slate-100 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            count={counts.all}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterButton
            label="Added"
            count={counts.added}
            active={activeFilter === "added"}
            onClick={() => setActiveFilter("added")}
          />
          <FilterButton
            label="Removed"
            count={counts.removed}
            active={activeFilter === "removed"}
            onClick={() => setActiveFilter("removed")}
          />
          <FilterButton
            label="Modified"
            count={counts.modified}
            active={activeFilter === "modified"}
            onClick={() => setActiveFilter("modified")}
          />
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto overscroll-contain px-6 py-5">
        <div className="space-y-4">
          {filteredChanges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No changes found for this filter.
            </div>
          ) : (
            filteredChanges.map((change, index) => {
              const meta = statusStyles[change.status];
              const key = String(change.id ?? `${change.status}-${index}`);
              const isExpanded = expanded[key] === true;
              const hasDetails = Boolean(change.old_summary || change.new_summary);
              return (
                <article
                  key={change.id ?? `${change.status}-${index}`}
                  className="group relative flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
                >
                  <div className={`w-1 ${meta.accentClass}`} />
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-start gap-2 px-4 pt-3">
                      <div className="flex flex-1 items-center gap-2 text-sm font-semibold">
                        <span className={`rounded-full px-2 py-1 text-xs ${meta.pillClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-slate-900">{change.title}</span>
                      </div>
                      <button
                        type="button"
                        disabled={!hasDetails}
                        className={`absolute right-3 top-3 rounded-full p-[0.36rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${hasDetails ? "group/chevron cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "cursor-default text-slate-300"}`}
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
                        <ChevronDownIcon
                          className={`h-6 w-6 transition ${isExpanded ? "rotate-180" : ""} ${
                            hasDetails ? "group-hover/chevron:scale-[1.2]" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="px-4 pb-3">
                      <p className="text-sm text-slate-600">{change.change_summary}</p>
                    </div>
                    {isExpanded && hasDetails ? (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                        {change.old_summary ? (
                          <p>
                            <span className="font-semibold text-slate-800">Old:</span> {change.old_summary}
                          </p>
                        ) : null}
                        {change.new_summary ? (
                          <p className="mt-2">
                            <span className="font-semibold text-slate-800">New:</span> {change.new_summary}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

type FilterButtonProps = {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
};

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <Button
      variant={active ? "pill" : "ghost"}
      size="sm"
      onClick={onClick}
      className={active ? "border border-emerald-100" : ""}
    >
      {label} ({count})
    </Button>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m7 7 10 10M17 7 7 17" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m7 10 5 5 5-5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
