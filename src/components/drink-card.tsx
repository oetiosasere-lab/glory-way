import type { Drink } from "@/lib/drinks";

export function DrinkCard({ drink }: { drink: Drink }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {drink.image ? (
          <img
            src={drink.image}
            alt={`${drink.name} bottle`}
            loading="lazy"
            width={900}
            height={1100}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary/80">
            Image unavailable
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
          {drink.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{drink.name}</h3>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            By the crate
          </span>
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {drink.size} · {drink.brewer}
        </p>
        <p className="mt-1 text-sm text-foreground/80">{drink.note}</p>
      </div>
    </article>
  );
}