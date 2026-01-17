import { Button } from "../ui/button";
import { AlignmentDropzones } from "../ui/reactDropzone";
import { TopNav } from "../ui/topnav";

export default function PaperAlignmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <TopNav active="Paper Alignment" />

        <main className="mt-10 flex-1">
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold text-slate-900">
                Practice Paper Syllabus Alignment
              </h1>
              <p className="mt-2 text-base text-slate-600">
                Check if your practice paper questions align with the selected syllabus.
              </p>
            </div>

            <div className="mt-8">
              <AlignmentDropzones />
            </div>

            <div className="mt-6">
              <Button
                variant="solid"
                className="bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500"
              >
                Analyze Paper
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
