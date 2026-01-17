"use client";

import { useCallback, useState } from "react";
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
      // Send both files to analyze endpoint
      console.log('📤 Analyzing paper...');
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
