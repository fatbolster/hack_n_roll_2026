import { ReactNode } from "react";
import { Button } from "./button";

type NavItem = {
  label: string;
  active?: boolean;
  icon?: ReactNode;
};

export function TopNav() {
  const navItems: NavItem[] = [
    { label: "Home", active: true, icon: <HomeIcon className="h-4 w-4" /> },
    { label: "Syllabus Changes" },
    { label: "Paper Alignment" },
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
            variant={item.active ? "navActive" : "nav"}
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

type IconProps = React.SVGProps<SVGSVGElement>;

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
