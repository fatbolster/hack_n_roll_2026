import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { TopNav } from "./ui/topnav";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <TopNav />
        <main className="mt-14 flex flex-1 flex-col items-center text-center">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <SparklesIcon className="h-4 w-4 text-emerald-600" />
            <span>AI-Powered Syllabus Intelligence</span>
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Stay Ahead of <span className="text-emerald-600">Syllabus Changes</span>
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            J3 helps tutors instantly detect syllabus changes and verify practice paper
            alignment. Stop guessing—start teaching with confidence.
          </p>

          <section className="mt-12 grid w-full gap-6 lg:grid-cols-2">
          <FeatureCard
            title="Syllabus Change Detection"
            description="Upload old and new MOE syllabus PDFs to instantly identify what's been added, removed, or modified."
            ctaLabel="Compare Syllabi"
            href="/SyllabusChanges"
            icon={<LinkIcon className="h-6 w-6 text-emerald-600" />}
          />
            <FeatureCard
              title="Practice Paper Alignment"
              description="Analyze your practice papers against the latest syllabus to ensure every question is still relevant."
              ctaLabel="Analyze Paper"
              href="/PaperAlignment"
              icon={<ClipboardIcon className="h-6 w-6 text-emerald-600" />}
            />
          </section>

          <p className="mt-12 text-sm text-slate-500">
            Built for tutors who need reliable, explainable syllabus intelligence.
          </p>
        </main>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  icon: ReactNode;
  href?: string;
};

function FeatureCard({ title, description, ctaLabel, icon, href }: FeatureCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 text-left shadow-sm ring-1 ring-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6">
        {href ? (
          <Link href={href}>
            <Button variant="link" size="sm" endIcon={<ArrowRightIcon className="h-4 w-4" />}>
              {ctaLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="link" size="sm" endIcon={<ArrowRightIcon className="h-4 w-4" />}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

function SparklesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M9 3 10.5 7.5 15 9 10.5 10.5 9 15 7.5 10.5 3 9 7.5 7.5 9 3ZM16 13.5 16.75 15.25 18.5 16 16.75 16.75 16 18.5 15.25 16.75 13.5 16 15.25 15.25 16 13.5ZM18 6 18.5 7.5 20 8 18.5 8.5 18 10 17.5 8.5 16 8 17.5 7.5 18 6Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M7.5 15.5 6 17a4 4 0 0 0 5.66 5.66l2-2M16.5 8.5 18 7a4 4 0 0 0-5.66-5.66l-2 2M9.5 14.5l5-5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="5.5"
        y="5"
        width="13"
        height="16"
        rx="2"
        ry="2"
        strokeWidth="1.6"
      />
      <path
        d="M9.5 5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M9 14h6M9 17h3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M5 12h14m0 0-5-5m5 5-5 5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
