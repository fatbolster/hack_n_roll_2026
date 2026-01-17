"use client";

import { useCallback, useState } from "react";
import type { SVGProps } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";

export function AlignmentDropzones() {
  const [practiceFile, setPracticeFile] = useState<File | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);

  const handlePracticeDrop = useCallback((acceptedFiles: File[]) => {
    setPracticeFile(acceptedFiles[0] ?? null);
  }, []);

  const handleSyllabusDrop = useCallback((acceptedFiles: File[]) => {
    setSyllabusFile(acceptedFiles[0] ?? null);
  }, []);

  const handlePracticeClear = useCallback(() => {
    setPracticeFile(null);
  }, []);

  const handleSyllabusClear = useCallback(() => {
    setSyllabusFile(null);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <UploadZone
        title="Practice Paper PDF"
        helperText="Upload your practice paper"
        file={practiceFile}
        onDrop={handlePracticeDrop}
        onClear={handlePracticeClear}
      />
      <UploadZone
        title="Syllabus Version"
        helperText="Upload the syllabus PDF to check against"
        file={syllabusFile}
        onDrop={handleSyllabusDrop}
        onClear={handleSyllabusClear}
      />
    </div>
  );
}

type SyllabusDropzonesProps = {
  onCompare?: () => void;
};

export function SyllabusDropzones({ onCompare }: SyllabusDropzonesProps = {}) {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [errorState, setErrorState] = useState({ old: false, new: false });

  const handleOldDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] ?? null;
    setOldFile(file);
    if (file) {
      setErrorState((prev) => ({ ...prev, old: false }));
    }
  }, []);

  const handleNewDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] ?? null;
    setNewFile(file);
    if (file) {
      setErrorState((prev) => ({ ...prev, new: false }));
    }
  }, []);

  const handleOldClear = useCallback(() => {
    setOldFile(null);
    setErrorState((prev) => ({ ...prev, old: false }));
  }, []);

  const handleNewClear = useCallback(() => {
    setNewFile(null);
    setErrorState((prev) => ({ ...prev, new: false }));
  }, []);

  const handleCompareClick = useCallback(() => {
    const missingOld = !oldFile;
    const missingNew = !newFile;

    if (missingOld || missingNew) {
      setErrorState({ old: missingOld, new: missingNew });
      return;
    }

    onCompare?.();
  }, [newFile, oldFile, onCompare]);

  const showOldError = errorState.old;
  const showNewError = errorState.new;
  const hasAnyErrors = showOldError || showNewError;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <UploadZone
          title="Old Syllabus PDF"
          helperText="Upload the previous syllabus version"
          file={oldFile}
          onDrop={handleOldDrop}
          onClear={handleOldClear}
          showError={showOldError}
        />
        <UploadZone
          title="New Syllabus PDF"
          helperText="Upload the latest syllabus version"
          file={newFile}
          onDrop={handleNewDrop}
          onClear={handleNewClear}
          showError={showNewError}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          variant="solid"
          startIcon={<CompareIcon className="h-4 w-4" />}
          className="bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500"
          onClick={handleCompareClick}
        >
          Compare Syllabi
        </Button>
        {hasAnyErrors ? (
          <span className="text-sm font-semibold text-rose-600">Missing PDF</span>
        ) : null}
      </div>
    </>
  );
}

type UploadZoneProps = {
  title: string;
  helperText: string;
  file: File | null;
  onDrop: (files: File[]) => void;
  onClear: () => void;
  showError?: boolean;
};

function UploadZone({ title, helperText, file, onDrop, onClear, showError }: UploadZoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-700">{title}</div>

      <div
        {...getRootProps()}
        className={cn(
          "group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-6 text-center shadow-sm ring-1 ring-slate-100 transition",
          isDragActive ? "border-emerald-400 bg-emerald-50/60 ring-emerald-100" : "border-slate-200",
          isDragReject ? "border-rose-300 bg-rose-50 ring-rose-100" : "",
          showError
            ? "border-red-600 bg-red-100 ring-red-400 shadow-[0_0_0_6px_rgba(239,68,68,0.35)]"
            : "",
        )}
      >
        <input {...getInputProps()} />
        <UploadIcon className="h-10 w-10 text-slate-400 transition group-hover:scale-105 group-hover:text-slate-500" />
        <p className="mt-4 text-sm font-semibold text-slate-800">Drag & drop or click to upload</p>
        <p className="text-xs text-slate-500">{helperText}</p>
        {showError ? (
          <p className="mt-3 text-xs font-semibold text-red-600">Please add missing PDF</p>
        ) : null}

        {file ? (
          <div className="mt-4 flex w-full max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            <FileIcon className="h-4 w-4" />
            <span className="truncate" title={file.name}>
              {file.name}
            </span>
            <button
              type="button"
              aria-label="Remove file"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onClear();
              }}
              className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function cn(...classes: Array<string | null | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type IconProps = SVGProps<SVGSVGElement>;

function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 4v12m0-12L8.5 7.5M12 4l3.5 3.5M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M7.5 4h6.4a1 1 0 0 1 .7.29l3.1 3.08a1 1 0 0 1 .3.71V19a1 1 0 0 1-1 1h-9.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 4.5V8a1 1 0 0 0 1 1h3.5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CompareIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="m7.5 7.5-3 3 3 3m-3-3h9M16.5 16.5l3-3-3-3m3 3h-9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M19 6h-1.5m-11 0H5m2 0h10m-8.5 0V4.5A1.5 1.5 0 0 1 10 3h4a1.5 1.5 0 0 1 1.5 1.5V6m-7 0h7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6.5 16.4 18a1.5 1.5 0 0 1-1.5 1.4h-4.8A1.5 1.5 0 0 1 8.6 18L8 6.5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.5 10.5v6M13.5 10.5v6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
