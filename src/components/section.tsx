import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24", className)}>
      {(eyebrow || title || description) && (
        <div
          ref={ref}
          className={cn(
            "reveal max-w-2xl",
            align === "center" && "mx-auto text-center",
          )}
        >
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-base text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}