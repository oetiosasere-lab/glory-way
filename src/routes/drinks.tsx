import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Section } from "@/components/section";
import { DrinkCard } from "@/components/drink-card";
import { drinks, type DrinkCategory } from "@/lib/drinks";
import { Search } from "lucide-react";

export const Route = createFileRoute("/drinks")({
  head: () => ({
    meta: [
      { title: "Drinks Available — Glory Way Limited" },
      {
        name: "description",
        content:
          "Browse energy drinks, beers, stouts, malts, soft drinks, spirits and wines stocked at Glory Way Limited. Delivered in bottles and cans.",
      },
      { property: "og:title", content: "Drinks Available at Glory Way Limited" },
      {
        property: "og:description",
        content:
          "Energy drinks, beers, stouts, malts, soft drinks and wines — delivered to your door.",
      },
    ],
  }),
  component: DrinksPage,
});

const categories: { id: string; label: string; cat?: DrinkCategory }[] = [
  { id: "all", label: "All Drinks" },
  { id: "energy", label: "Energy Drinks", cat: "Energy" },
  { id: "lager", label: "Beers & Lagers", cat: "Lager" },
  { id: "stout", label: "Stouts", cat: "Stout" },
  { id: "malt", label: "Malt Drinks", cat: "Malt" },
  { id: "soft", label: "Soft Drinks", cat: "Soft Drink" },
  { id: "bitters", label: "Bitters (Action Bitters)", cat: "Bitters" },
  { id: "spirits", label: "Spirits & Wine", cat: "Spirits & Wine" },
];

function DrinksPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return drinks.filter((d) => {
      const matchCat =
        selectedCat === "all" ||
        categories.find((c) => c.id === selectedCat)?.cat === d.category;
      const q = query.trim().toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.brewer.toLowerCase().includes(q) ||
        d.size.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCat, query]);

  return (
    <div>
      <Section
        eyebrow="Drinks available"
        title="Stocked, chilled, and ready to move."
        description="Available in bottles and cans. We sell by the crate and pack. Send an enquiry or call and we'll confirm crate/pack quantities and delivery to your door."
      >
        {/* Controls: Search and Categories */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drinks (e.g. Red Bull, 33, Heineken, Climax)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = selectedCat === c.id;
              const count =
                c.id === "all"
                  ? drinks.length
                  : drinks.filter((d) => d.category === c.cat).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-base font-semibold text-foreground">
              No drinks found matching "{query}"
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try searching for another drink brand, or browse through all categories.
            </p>
            <button
              onClick={() => {
                setSelectedCat("all");
                setQuery("");
              }}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((d) => (
              <DrinkCard key={d.slug} drink={d} />
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-primary/20 bg-secondary p-6 text-secondary-foreground sm:p-8">
          <h3 className="font-display text-xl font-semibold">
            Don't see what you want?
          </h3>
          <p className="mt-2 text-secondary-foreground/85">
            We restock daily. Tell us the brand, packaging (bottle or can), and quantity — chances are it's
            already at the warehouse.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Ask about a drink
          </Link>
        </div>
      </Section>
    </div>
  );
}
