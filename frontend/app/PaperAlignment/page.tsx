"use client";

import { useCallback, useState } from "react";
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
            <AlignmentDropzones onAnalyze={handleAnalyze} />
          </div>

          <div className="mt-8">
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
