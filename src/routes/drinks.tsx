import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/section";
import { DrinkCard } from "@/components/drink-card";
import { drinks } from "@/lib/drinks";

export const Route = createFileRoute("/drinks")({
  head: () => ({
    meta: [
      { title: "Drinks Available — Glory Way Limited" },
      {
        name: "description",
        content:
          "Browse the Nigerian Breweries lagers, stouts, malts and soft drinks in stock at Glory Way Limited. Delivered to your door during our 11-hour operating window.",
      },
      { property: "og:title", content: "Drinks Available at Glory Way Limited" },
      {
        property: "og:description",
        content:
          "Lagers, stouts, malts and soft drinks from Nigerian Breweries — delivered to your door.",
      },
    ],
  }),
  component: DrinksPage,
});

function DrinksPage() {
  return (
    <div>
      <Section
        eyebrow="Drinks available"
        title="Stocked, chilled, and ready to move."
        description="Available in bottles and cans. We sell by the crate, not single bottles. Send an enquiry or call and we'll confirm crate quantities and the current rate for your order."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {drinks.map((d) => (
            <DrinkCard key={d.slug} drink={d} />
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-primary/20 bg-secondary p-6 text-secondary-foreground sm:p-8">
          <h3 className="font-display text-xl font-semibold">
            Don't see what you want?
          </h3>
          <p className="mt-2 text-secondary-foreground/85">
            We restock daily. Tell us the brand and quantity — chances are it's
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