"use client";

import { useCallback, useState } from "react";
import type { SVGProps } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { TopNav } from "../ui/topnav";

export default function SyllabusChangesPage() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const handleOldDrop = useCallback((acceptedFiles: File[]) => {
    setOldFile(acceptedFiles[0] ?? null);
  }, []);

  const handleNewDrop = useCallback((acceptedFiles: File[]) => {
    setNewFile(acceptedFiles[0] ?? null);
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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <UploadZone
              title="Old Syllabus PDF"
              helperText="Upload the previous syllabus version"
              file={oldFile}
              onDrop={handleOldDrop}
            />
            <UploadZone
              title="New Syllabus PDF"
              helperText="Upload the latest syllabus version"
              file={newFile}
              onDrop={handleNewDrop}
            />
          </div>

          <div className="mt-8">
            <Button
              variant="solid"
              startIcon={<CompareIcon className="h-4 w-4" />}
              className="bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500"
            >
              Compare Syllabi
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

type UploadZoneProps = {
  title: string;
  helperText: string;
  file: File | null;
  onDrop: (files: File[]) => void;
};

function UploadZone({ title, helperText, file, onDrop }: UploadZoneProps) {
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
        )}
      >
        <input {...getInputProps()} />
        <UploadIcon className="h-10 w-10 text-slate-400 transition group-hover:scale-105 group-hover:text-slate-500" />
        <p className="mt-4 text-sm font-semibold text-slate-800">
          Drag & drop or click to upload
        </p>
        <p className="text-xs text-slate-500">{helperText}</p>

        {file ? (
          <div className="mt-4 flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            <FileIcon className="h-4 w-4" />
            <span className="truncate" title={file.name}>
              {file.name}
            </span>
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
