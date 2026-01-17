"use client";

import { useCallback, useState, type SVGProps } from "react";
import { Button } from "../ui/button";
import { AlignmentDropzones } from "../ui/reactDropzone";
import { TopNav } from "../ui/topnav";
import { PaperAlignmentModal } from "./modal";

export default function PaperAlignmentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [practiceFile, setPracticeFile] = useState<File | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFilesChange = useCallback((practice: File | null, syllabus: File | null) => {
    setPracticeFile(practice);
    setSyllabusFile(syllabus);
  }, []);

  const handleAnalyze = useCallback(async () => {
    console.log('🔍 Analyze button clicked');
    console.log('📄 Practice file:', practiceFile?.name);
    console.log('📄 Syllabus file:', syllabusFile?.name);
    
    if (!practiceFile || !syllabusFile) {
      console.log('❌ Missing files');
      alert('Please upload both a practice paper and syllabus');
      return;
    }

    console.log('✅ Both files present, starting analysis...');
    setIsAnalyzing(true);
    try {
      // Step 1: Upload practice paper
      console.log('📤 Step 1: Uploading practice paper...');
      const paperFormData = new FormData();
      paperFormData.append('file', practiceFile);
      
      const paperUploadResponse = await fetch('http://localhost:8000/api/upload-paper', {
        method: 'POST',
        body: paperFormData,
      });
      
      if (!paperUploadResponse.ok) {
        throw new Error('Failed to upload practice paper');
      }
      
      const paperUploadResult = await paperUploadResponse.json();
      console.log('✅ Practice paper uploaded:', paperUploadResult.filename);
      
      // Step 2: Upload syllabus
      console.log('📤 Step 2: Uploading syllabus...');
      const syllabusFormData = new FormData();
      syllabusFormData.append('file', syllabusFile);
      
      const syllabusUploadResponse = await fetch('http://localhost:8000/api/upload-syllabus', {
        method: 'POST',
        body: syllabusFormData,
      });
      
      if (!syllabusUploadResponse.ok) {
        throw new Error('Failed to upload syllabus');
      }
      
      const syllabusUploadResult = await syllabusUploadResponse.json();
      console.log('✅ Syllabus uploaded:', syllabusUploadResult.filename);
      
      // Step 3: Analyze using uploaded files
      console.log('📤 Step 3: Analyzing paper...');
      const formData = new FormData();
      formData.append('paper', practiceFile);
      formData.append('syllabus', syllabusFile);

      const response = await fetch('http://localhost:8000/api/analyze-paper', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to analyze paper');
      }

      const result = await response.json();
      console.log('✅ Analysis result:', result);
      
      // Store the result in sessionStorage for the modal to access
      sessionStorage.setItem('paperAnalysisResult', JSON.stringify(result));
      console.log('💾 Stored in sessionStorage');
      
      setRefreshToken((prev) => prev + 1);
      setIsModalOpen(true);
      console.log('✅ Modal opened');
    } catch (error) {
      console.error('❌ Error analyzing paper:', error);
      alert('Error analyzing paper. Please try again.');
    } finally {
      setIsAnalyzing(false);
      console.log('🏁 Analysis complete');
    }
  }, [practiceFile, syllabusFile]);

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
            <AlignmentDropzones onFilesChange={handleFilesChange} />
          </div>

          <div className="mt-8 space-y-6">
            <Button
              variant="solid"
              startIcon={<AnalyzeIcon className="h-4 w-4" />}
              className="bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500"
              onClick={handleAnalyze}
              disabled={!practiceFile || !syllabusFile || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Paper'}
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
