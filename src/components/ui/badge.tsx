import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "destructive" | "warning" | "info" | "secondary" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent",
  warning:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent",
  info:        "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-transparent",
  secondary:   "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border-transparent",
  outline:     "bg-transparent border-[var(--border)] text-[var(--muted)]",
};

export function Badge({
  children,
  variant = "secondary",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
