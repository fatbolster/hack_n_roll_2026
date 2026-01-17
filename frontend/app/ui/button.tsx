import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import type { SVGProps } from "react";

type ButtonVariant = "solid" | "ghost" | "pill" | "link" | "nav" | "navActive";
type ButtonSize = "sm" | "md";

const variantStyles: Record<ButtonVariant, string> = {
  solid:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-500",
  ghost:
    "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400",
  pill:
    "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50 focus-visible:outline-emerald-500",
  link:
    "bg-transparent text-emerald-700 hover:text-emerald-800 hover:underline underline-offset-4",
  nav:
    "bg-transparent text-slate-700 ring-1 ring-transparent hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-emerald-500",
  navActive:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 shadow-sm hover:bg-emerald-100 focus-visible:outline-emerald-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

function cn(...classes: Array<string | null | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const primaryButtonClassName =
  "bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-emerald-500";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "solid",
      size = "md",
      className,
      startIcon,
      endIcon,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-medium cursor-pointer transition-colors hover:cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {startIcon ? <span className="flex items-center">{startIcon}</span> : null}
        <span>{children}</span>
        {endIcon ? <span className="flex items-center">{endIcon}</span> : null}
      </button>
    );
  },
);

Button.displayName = "Button";

type SyllabusActionButtonProps = {
  onClick?: () => void;
};

export function CompareSyllabiButton({ onClick }: SyllabusActionButtonProps) {
  return (
    <Button
      variant="solid"
      startIcon={<CompareIcon className="h-4 w-4" />}
      className={primaryButtonClassName}
      onClick={onClick}
    >
      Compare Syllabi
    </Button>
  );
}

export function CheckMappingButton({ onClick }: SyllabusActionButtonProps) {
  return (
    <Button
      variant="solid"
      startIcon={<CompareIcon className="h-4 w-4" />}
      className={primaryButtonClassName}
      onClick={onClick}
    >
      Check Mapping
    </Button>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

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
