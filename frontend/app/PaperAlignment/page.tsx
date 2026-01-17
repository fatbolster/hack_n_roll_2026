"use client";

import { useCallback, useState, type SVGProps } from "react";
import { Button } from "../ui/button";
import { AlignmentDropzones } from "../ui/reactDropzone";
import { TopNav } from "../ui/topnav";
import { PaperAlignmentModal } from "./modal";

export default function PaperAlignmentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleAnalyze = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <TopNav active="Paper Alignment" />

        <main className="mt-12">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">
              Practice Paper Syllabus Alignment
            </h1>
            <p className="text-base text-slate-600">
              Check if your practice paper questions align with the selected syllabus.
            </p>
          </div>

          <div className="mt-8">
            <AlignmentDropzones />
          </div>

          <div className="mt-8 space-y-6">
            <Button
              variant="solid"
              startIcon={<AnalyzeIcon className="h-4 w-4" />}
              className="bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500"
              onClick={handleAnalyze}
            >
              Analyze Paper
            </Button>
            <PaperAlignmentModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              refreshToken={refreshToken}
            />
          </div>

        </main>
      </div>
    </div>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

function AnalyzeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="4.75"
        y="3.75"
        width="9.5"
        height="14.5"
        rx="1.4"
        strokeWidth="1.6"
      />
      <path d="M8 7.5h3.5M8 11h3.5" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16.25" cy="15.75" r="3" strokeWidth="1.6" />
      <path d="m18.4 17.9 2.35 2.35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
