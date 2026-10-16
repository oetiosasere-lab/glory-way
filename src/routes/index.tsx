import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-drinks.jpg";
import { drinks } from "@/lib/drinks";
import { DrinkCard } from "@/components/drink-card";
import { Section } from "@/components/section";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glory Way Limited — Trusted Drinks Delivery in Nigeria" },
      {
        name: "description",
        content:
          "Order Nigerian Breweries beers, malts and soft drinks. Trusted by families across Edo State. Honest prices, fast delivery.",
      },
      { property: "og:title", content: "Glory Way Limited — Drinks Delivery" },
      {
        property: "og:description",
        content:
          "Trusted drinks delivery for families. Nigerian Breweries and more, at honest prices.",
      },
    ],
  }),
  component: HomePage,
});

const benefits = [
  {
    title: "Reliable hours",
    body: "Open 11 hours a day, 6 days a week, 365 days a year. We're here when you need us most.",
  },
  {
    title: "Trusted by adults",
    body: "Sealed bottles, checked drivers, and strict 18+ verification on every delivery.",
  },
  {
    title: "Honest, affordable prices",
    body: "Direct-from-warehouse pricing on Nigerian Breweries favourites — no hidden fees.",
  },
];

function HomePage() {
  return (
    <div>
      <Hero />
      <Benefits />
      <Featured />
      <CtaBand />
    </div>
  );
}

function Hero() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(60%_60%_at_80%_20%,color-mix(in_oklab,var(--color-primary)_50%,transparent),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div ref={ref} className="reveal">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Open 11 hours a day, 6 days a week
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            Your favourite drinks,{" "}
            <span className="text-primary">delivered to your door.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-secondary-foreground/85 sm:text-lg">
            Glory Way Limited is a licensed sub-distributor of Nigerian Breweries
            beers, malts and soft drinks — delivering them safely to your door at
            honest prices during our 11-hour daily window.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Order now
            </Link>
            <Link
              to="/drinks"
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              View drinks
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-primary/20 pt-6 text-sm">
            <div>
              <dt className="text-secondary-foreground/70">Years serving</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-primary">12+</dd>
            </div>
            <div>
              <dt className="text-secondary-foreground/70">Open daily</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-primary">11 hours</dd>
            </div>
            <div>
              <dt className="text-secondary-foreground/70">Brands stocked</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-primary">40+</dd>
            </div>
          </dl>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-2xl" aria-hidden />
          <img
            src={heroImg}
            alt="Curated selection of Nigerian Breweries drinks in a moody green and gold setting"
            width={1600}
            height={1200}
            className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <Section
      eyebrow="Why adults choose Glory"
      title="Three promises we keep on every order"
      description="We built Glory Way Limited around what adults actually need from a drinks supplier: reliability, safety, and prices that don't sting."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map((b) => {
          return (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <h3 className="font-display text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-foreground/80">{b.body}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Featured() {
  const featured = drinks.slice(0, 4);
  return (
    <Section
      eyebrow="Featured this week"
      title="Chilled, sealed, and ready to deliver"
      description="A snapshot of what's moving fastest from our warehouse. See the full list on the Drinks page."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((d) => (
          <DrinkCard key={d.slug} drink={d} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/drinks"
          className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          See every drink available
        </Link>
      </div>
    </Section>
  );
}

function CtaBand() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
      <div
        ref={ref}
        className="reveal grid gap-8 rounded-3xl border border-primary/20 bg-secondary p-8 text-secondary-foreground shadow-lg sm:p-12 md:grid-cols-[1.4fr_1fr] md:items-center"
      >
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to order? We're picking up the phone right now.
          </h2>
          <p className="mt-3 max-w-xl text-secondary-foreground/85">
            Call the warehouse or send an enquiry — we'll confirm your drinks,
            price, and delivery time in minutes.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Order now
          </Link>
          <a
            href="tel:07051656621"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Contact us · 0705 165 6621
          </a>
        </div>
      </div>
    </section>
  );
}