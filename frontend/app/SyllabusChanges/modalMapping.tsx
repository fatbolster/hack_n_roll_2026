"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import { Button } from "../ui/button";

type MappingStatus = "added" | "removed" | "modified";

type MappingItem = {
  topic: string;
  status: MappingStatus;
  change_summary?: string;
  old_summary?: string;
  new_summary?: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  refreshToken?: number;
};

const statusStyles: Record<
  MappingStatus,
  { label: string; pill: string; text: string; accent: string }
> = {
  added: {
    label: "Added",
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    text: "text-emerald-700",
    accent: "bg-emerald-500",
  },
  removed: {
    label: "Removed",
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    text: "text-rose-700",
    accent: "bg-rose-500",
  },
  modified: {
    label: "Modified",
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    text: "text-amber-700",
    accent: "bg-amber-500",
  },
};

export function SyllabusMappingModal({ isOpen, onClose, refreshToken = 0 }: ModalProps) {
  const [mappings, setMappings] = useState<MappingItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadMappings() {
      try {
        const data = await import("./database.json");
        const raw = (data.default as any) ?? {};
        const sourceArray = Array.isArray(raw.report?.syllabi_diff)
          ? raw.report.syllabi_diff
          : Array.isArray(raw.changes)
            ? raw.changes
            : Array.isArray(raw)
              ? raw
              : [];

        const parsed: MappingItem[] = sourceArray
          .map((item: any, index: number) => {
            const status = item?.status;
            if (status !== "added" && status !== "removed" && status !== "modified") {
              return null;
            }
            return {
              topic: item?.title ?? item?.topic ?? `Topic ${index + 1}`,
              status,
              change_summary: item?.change_summary ?? item?.description,
              old_summary: item?.old_summary,
              new_summary: item?.new_summary,
            };
          })
          .filter(Boolean) as MappingItem[];

        if (isMounted) {
          setMappings(parsed);
          setExpanded({});
        }
      } catch (error) {
        console.error("Failed to load syllabus mapping", error);
        if (isMounted) setMappings([]);
      }
    }

    loadMappings();

    return () => {
      isMounted = false;
    };
  }, [isOpen, refreshToken]);

  const counts = useMemo(
    () =>
      mappings.reduce(
        (acc, item) => {
          acc.all += 1;
          acc[item.status] += 1;
          return acc;
        },
        { all: 0, added: 0, removed: 0, modified: 0 },
      ),
    [mappings],
  );

  if (!isOpen) return null;

  return (
    <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Check Mapping Results</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="text-slate-900">Total {counts.all}</span>
            <span className="text-emerald-600">+ {counts.added} Added</span>
            <span className="text-rose-600">- {counts.removed} Removed</span>
            <span className="text-amber-600">≈ {counts.modified} Modified</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          aria-label="Close mapping results"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {mappings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No mapping data available for these syllabi.
          </div>
        ) : (
          <div className="space-y-4">
            {mappings.map((item, index) => {
              const meta = statusStyles[item.status];
              const key = `${item.topic}-${index}`;
              const isExpanded = expanded[key] === true;
              const hasDetails = Boolean(item.change_summary || item.old_summary || item.new_summary);
              return (
                <article
                  key={key}
                  className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
                >
                  <div className={`absolute left-0 top-0 h-full w-1 ${meta.accent}`} />
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-1 flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                        <span className={`rounded-full px-2 py-1 text-xs ${meta.pill}`}>{meta.label}</span>
                        <span>{item.topic}</span>
                      </div>
                      <button
                        type="button"
                        disabled={!hasDetails}
                        className={`rounded-full p-[0.36rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${hasDetails ? "group/chevron cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "cursor-default text-slate-300"}`}
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
                    {item.change_summary ? (
                      <p className="text-sm text-slate-700">{item.change_summary}</p>
                    ) : null}
                    {isExpanded && hasDetails ? (
                      <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Old syllabus</p>
                          <p className="mt-1 text-slate-800">{item.old_summary || "Not present"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">New syllabus</p>
                          <p className="mt-1 text-slate-800">{item.new_summary || "Not present"}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
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




