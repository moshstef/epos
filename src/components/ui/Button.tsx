import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  secondary:
    "rounded-lg border border-border text-foreground hover:bg-surface-hover",
  ghost:
    "rounded-lg text-muted hover:text-foreground hover:bg-surface-hover underline",
  success: "rounded-full bg-green-600 text-white hover:bg-green-700",
  danger: "rounded-full bg-red-600 text-white hover:bg-red-700",
  icon: "rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  "icon-outline":
    "rounded-full border border-border text-muted hover:bg-surface-hover",
} as const;

const sizes = {
  sm: "min-h-10 min-w-10 px-3 py-2 text-sm gap-2",
  md: "min-h-11 min-w-11 px-4 py-2.5 text-sm gap-2",
  lg: "min-h-12 min-w-12 px-6 py-3 text-base gap-3",
  icon: "h-10 w-10",
  "icon-lg": "h-16 w-16",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
