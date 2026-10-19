import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/section";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Glory Way Limited drinks packages" },
      {
        name: "description",
        content:
          "Household restock, event supply, and business partner services from Glory Way Limited. Fair prices, reliable delivery.",
      },
      { property: "og:title", content: "Glory Way Limited Services" },
      {
        property: "og:description",
        content:
          "Household restock, event supply, and business partner services. Fair prices, reliable delivery.",
      },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    name: "Home Restock",
    price: "From ₦6,500 / crate",
    body: "A rolling order for households. Tell us your favourites and the days you want them delivered.",
    perks: [
      "Choose your delivery day",
      "Pause or cancel anytime",
      "Priority driver during peak hours",
    ],
  },
  {
    name: "Events & Celebrations",
    price: "Custom quote",
    body: "Weddings, naming ceremonies, birthdays. We plan the drinks list with you and deliver on the day.",
    perks: [
      "Free consultation call",
      "Buy-back on unopened crates",
      "Ice, cups and openers included",
    ],
  },
  {
    name: "Business Partner",
    price: "Wholesale rates",
    body: "For bars, restaurants, and small shops. Stable wholesale pricing and scheduled restocks.",
    perks: [
      "Dedicated account manager",
      "Weekly restock rounds",
      "Net-7 payment terms available",
    ],
  },
];

function ServicesPage() {
  return (
    <div>
      <Section
        eyebrow="Services"
        title="Simple plans for homes, events, and businesses."
        description="Pick the way you like to order. Every service comes with the same reliable phone line, verified drivers, and warehouse-direct pricing."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((s) => {
            return (
              <article
                key={s.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="font-display text-xl font-semibold">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-primary">{s.price}</p>
                <p className="mt-3 text-sm text-foreground/80">{s.body}</p>
                <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-foreground/85">
                  {s.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Enquire about {s.name}
                </Link>
              </article>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
