"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import { Button } from "../ui/button";

type ChangeStatus = "added" | "removed" | "modified";

type ChangeItem = {
  id?: string | number;
  title: string;
  description: string;
  status: ChangeStatus;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
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

export function SyllabusChangesModal({ isOpen, onClose }: ModalProps) {
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<keyof SummaryCounts>("all");

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
            : Array.isArray(raw.report?.changes)
              ? raw.report.changes
              : [];

        const parsedChanges: ChangeItem[] = sourceArray
          .map((item, idx) => {
            const status = item?.status;
            if (status !== "added" && status !== "removed" && status !== "modified") {
              return null;
            }
            const title = item?.title ?? item?.topic_name ?? `Change ${idx + 1}`;
            const description = item?.description ?? "";
            return {
              id: item?.id ?? idx,
              status,
              title,
              description,
            };
          })
          .filter(Boolean) as ChangeItem[];

        if (isMounted) {
          setChanges(parsedChanges);
          setActiveFilter("all");
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
  }, [isOpen]);

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
      ? changes
      : changes.filter((change) => change.status === activeFilter);

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

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        <div className="space-y-4">
          {filteredChanges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No changes found for this filter.
            </div>
          ) : (
            filteredChanges.map((change, index) => {
              const meta = statusStyles[change.status];
              return (
                <article
                  key={change.id ?? `${change.status}-${index}`}
                  className="group relative flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
                >
                  <div className={`w-1 ${meta.accentClass}`} />
                  <div className="flex w-full flex-col gap-2 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className={`rounded-full px-2 py-1 text-xs ${meta.pillClass}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-900">{change.title}</span>
                    </div>
                    <p className="text-sm text-slate-600">{change.description}</p>
                  </div>
                  <span className="absolute right-3 top-3 text-slate-300 transition group-hover:text-slate-400">
                    <ChevronRightIcon className="h-4 w-4" />
                  </span>
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

function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m9 6 6 6-6 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
