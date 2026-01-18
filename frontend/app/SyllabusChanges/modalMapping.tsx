"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  refreshToken?: number;
  oldFileName?: string | null;
  newFileName?: string | null;
};

type MappingReport = {
  similarity_score?: number;
  similarity_label?: string;
  ai_justification?: {
    overview?: string;
    key_similarities?: string[];
    key_differences?: string[];
    recommendation?: string;
  };
};

const pillStyles = {
  high: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  partial: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

export function SyllabusMappingModal({
  isOpen,
  onClose,
  refreshToken = 0,
  oldFileName,
  newFileName,
}: ModalProps) {
  const [report, setReport] = useState<MappingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadReport() {
      setIsLoading(true);
      try {
        // Try to load from sessionStorage first (from API call)
        const storedData = sessionStorage.getItem('syllabusMappingResult');
        if (storedData) {
          console.log('📖 Loading mapping result from sessionStorage');
          const parsedData = JSON.parse(storedData);
          if (isMounted) setReport(parsedData);
        } else {
          // Fallback to placeholder data
          console.log('📖 No API data found, loading placeholder');
          const data = await import("./databaseMapPlaceholder.json");
          const sourceArray = Array.isArray(data.default) ? data.default : [];
          const firstEntry: MappingReport | null = sourceArray.length > 0 ? sourceArray[0] : null;
          if (isMounted) setReport(firstEntry);
        }
      } catch (error) {
        console.error("Failed to load syllabus mapping report", error);
        if (isMounted) setReport(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [isOpen, refreshToken]);

  const score = report?.similarity_score ?? null;
  const similarityText = score !== null ? `${Math.round(score)}%` : "N/A";
  const similarityLabel = report?.similarity_label ?? (score !== null && score >= 70 ? "Highly Mappable" : "Partially Mappable");
  const pillClass = (report?.similarity_label === "Highly Mappable" || (score !== null && score >= 70)) ? pillStyles.high : pillStyles.partial;
  const progressWidth = Math.max(0, Math.min(100, score ?? 0));

  const justification = useMemo(
    () => (report?.ai_justification ? { ...report.ai_justification } : {}),
    [report?.ai_justification],
  );

  if (!isOpen) return null;

  return (
    <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertIcon className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Syllabus Mapping Result</p>
            <p className="text-xs text-slate-500">AI-evaluated syllabus similarity overview</p>
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

      <div className="space-y-5 px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FilePill label="Old Syllabus" value={oldFileName ?? "No file uploaded"} />
          <FilePill label="New Syllabus" value={newFileName ?? "No file uploaded"} align="right" />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Similarity Score
              </p>
              <p className="text-4xl font-semibold text-amber-500">{similarityText}</p>
              <p className="text-xs text-slate-500">
                Based on topic coverage, learning outcomes, and content depth analysis.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${pillClass}`}>
              {similarityLabel}
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width]"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">AI Justification</p>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <p>{justification.overview ?? "No overview available for this comparison."}</p>
            <JustificationList title="Key Similarities" items={justification.key_similarities} />
            <JustificationList title="Key Differences" items={justification.key_differences} />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Recommendation</p>
              <p className="text-slate-700">
                {justification.recommendation ?? "No recommendations provided."}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-xs text-slate-500">Loading mapping insights...</p>
        ) : null}
      </div>
    </div>
  );
}

type FilePillProps = {
  label: string;
  value: string;
  align?: "left" | "right";
};

function FilePill({ label, value, align = "left" }: FilePillProps) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm ${align === "right" ? "text-right" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

type JustificationListProps = {
  title: string;
  items?: string[];
};

function JustificationList({ title, items }: JustificationListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="font-semibold text-slate-800">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
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

function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 5.2 4.5 18a1 1 0 0 0 .87 1.5h13.26a1 1 0 0 0 .87-1.5L12 5.2Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5M12 17v.5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
