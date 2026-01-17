import { ReactNode } from "react";
import { Button } from "./ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <Header />
        <main className="mt-14 flex flex-1 flex-col items-center text-center">
          <Button
            variant="pill"
            size="sm"
            startIcon={<SparklesIcon className="h-4 w-4 text-emerald-600" />}
          >
            AI-Powered Syllabus Intelligence
          </Button>

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
              icon={<LinkIcon className="h-6 w-6 text-emerald-600" />}
            />
            <FeatureCard
              title="Practice Paper Alignment"
              description="Analyze your practice papers against the latest syllabus to ensure every question is still relevant."
              ctaLabel="Analyze Paper"
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

function Header() {
  const navItems: Array<{ label: string; variant: "nav" | "navActive"; icon?: ReactNode }> =
    [
      { label: "Home", variant: "navActive", icon: <HomeIcon className="h-4 w-4" /> },
      { label: "Syllabus Changes", variant: "nav" },
      { label: "Paper Alignment", variant: "nav" },
    ];

  return (
    <header className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-semibold text-white shadow-sm">
          J3
        </div>
        <span className="text-lg font-semibold text-slate-800">
          Syllabus Intelligence
        </span>
      </div>
      <nav className="flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.variant === "navActive" ? "navActive" : "nav"}
            size="sm"
            startIcon={item.icon}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </header>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  icon: ReactNode;
};

function FeatureCard({ title, description, ctaLabel, icon }: FeatureCardProps) {
  return (
    <div className="rounded-3xl bg-white p-8 text-left shadow-sm ring-1 ring-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6">
        <Button variant="link" size="sm" endIcon={<ArrowRightIcon className="h-4 w-4" />}>
          {ctaLabel}
        </Button>
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

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.5v-5h-3v5H5a1 1 0 0 1-1-1z"
        strokeWidth="1.6"
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
