"use client";

import { useCallback, useState } from "react";
import { SyllabusDropzones } from "../ui/reactDropzone";
import { TopNav } from "../ui/topnav";
import { SyllabusChangesModal } from "./modal";
import { SyllabusMappingModal } from "./modalMapping";

export default function SyllabusChangesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingRefreshToken, setMappingRefreshToken] = useState(0);
  const [oldSyllabusFile, setOldSyllabusFile] = useState<File | null>(null); // left dropzone
  const [newSyllabusFile, setNewSyllabusFile] = useState<File | null>(null); // right dropzone

  const handleCompare = useCallback(() => {
    // Incrementing refreshToken forces the modal to reload its data even when already open.
    setRefreshToken((prev) => prev + 1);
    setIsModalOpen(true);
  }, []);

  const handleCheckMapping = useCallback(() => {
    setMappingRefreshToken((prev) => prev + 1);
    setIsMappingModalOpen(true);
  }, []);

  const handleFilesChange = useCallback((oldFile: File | null, newFile: File | null) => {
    // oldFile comes from the left dropzone, newFile from the right dropzone
    setOldSyllabusFile(oldFile);
    setNewSyllabusFile(newFile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <TopNav active="Syllabus Changes" />

        <main className="mt-12">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">
              Syllabus Change Detection
            </h1>
            <p className="text-base text-slate-600">
              Upload two syllabus PDFs to see what's changed between versions.
            </p>
          </div>

          <div className="mt-8">
            <SyllabusDropzones
              onCompare={handleCompare}
              onCheckMapping={handleCheckMapping}
              onFilesChange={handleFilesChange}
            />
            <SyllabusChangesModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              refreshToken={refreshToken}
            />
            <SyllabusMappingModal
              isOpen={isMappingModalOpen}
              onClose={() => setIsMappingModalOpen(false)}
              refreshToken={mappingRefreshToken}
              oldFileName={oldSyllabusFile?.name ?? null}
              newFileName={newSyllabusFile?.name ?? null}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
