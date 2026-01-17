import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { Button } from "./button";

type NavItem = {
  label: string;
  icon?: ReactNode;
  href: string;
};

type TopNavProps = {
  active?: NavItem["label"];
};

export function TopNav({ active = "Home" }: TopNavProps) {
  const navItems: NavItem[] = [
    { label: "Home", icon: <HomeIcon className="h-4 w-4" />, href: "/" },
    {
      label: "Syllabus Changes",
      icon: <ChangeIcon className="h-4 w-4" />,
      href: "/SyllabusChanges",
    },
    {
      label: "Paper Alignment",
      icon: <ClipboardIcon className="h-4 w-4" />,
      href: "/PaperAlignment",
    },
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
        {navItems.map((item) => {
          const isActive = item.label === active;
          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant={isActive ? "navActive" : "nav"}
                size="sm"
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

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

function ChangeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M5 15h9.5l-2.75 2.75M19 9h-9.5l2.75-2.75"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.25 17.75 14.5 15.5 12.25 13.25M11.75 6.25 9.5 8.5l2.25 2.25"
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
