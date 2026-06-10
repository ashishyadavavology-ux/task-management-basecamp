import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const sizes = {
    sm: { icon: "h-7 w-7 text-sm", text: "text-sm" },
    md: { icon: "h-9 w-9 text-base", text: "text-lg" },
    lg: { icon: "h-11 w-11 text-lg", text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground shadow-[var(--shadow-soft)]",
          s.icon,
        )}
      >
        B
      </div>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", s.text)}>Basecamp</span>
      )}
    </div>
  );
}
