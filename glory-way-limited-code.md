# Glory Way Limited — Project Code

All custom code for the Glory Way Limited website, one section per file.


## `src/routes/__root.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Glory Way Limited — Trusted Drinks Delivery in Nigeria" },
      {
        name: "description",
        content:
          "Glory Way Limited delivers Nigerian Breweries beers, malts and soft drinks to your door. Trusted, safe, and affordably priced for adults and families.",
      },
      { name: "author", content: "Glory Way Limited" },
      { property: "og:title", content: "Glory Way Limited — Drinks Delivery" },
      {
        property: "og:description",
        content:
          "Trusted delivery of Nigerian Breweries drinks. Honest prices, real people, always in stock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
```

## `src/routes/index.tsx`

```tsx
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
```

## `src/routes/about.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/section";
import warehouseImg from "@/assets/warehouse.jpg";
import ownerImg from "@/assets/owner.jpg.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Glory Way Limited — A licensed sub-distributor" },
      {
        name: "description",
        content:
          "Glory Way Limited is a licensed sub-distributor of Nigerian Breweries drinks serving Edo State households with trusted brands, fair prices and safe delivery.",
      },
      { property: "og:title", content: "About Glory Way Limited" },
      {
        property: "og:description",
        content:
          "A licensed sub-distributor of Nigerian Breweries drinks serving Edo State households with trusted brands and fair prices.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <Section
        eyebrow="About us"
        title="A licensed sub-distributor you can trust."
        description="Glory Way Limited supplies Nigerian Breweries drinks to homes, event planners, and small businesses across Edo State from our warehouse in Benin City."
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src={warehouseImg}
            alt="Interior of the Glory Way Limited drinks warehouse with organised pallets of Nigerian brewery products"
            loading="lazy"
            width={1600}
            height={1000}
            className="aspect-[16/10] w-full rounded-2xl object-cover shadow-lg"
          />
          <div className="space-y-4 text-foreground/85">
            <p>
              We are Glory Way Limited — a licensed sub-distributor of Nigerian
              Breweries and other trusted producers. Every crate we deliver was
              checked in at our own warehouse, kept cool, and handed to a driver
              we know by name.
            </p>
            <p>
              Because so many of our customers are adults ordering for their
              homes, we designed the whole service around three things: safety,
              honesty, and speed. That means sealed bottles, ID checks at the door,
              transparent pricing, and a phone line that a real person picks up
              during our 11-hour operating window.
            </p>
            <p>
              Whether you need one crate for a quiet Sunday or fifty for a wedding
              on short notice, Glory Way Limited is set up to say yes.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Meet the owner" title="The person behind the crates.">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 space-y-4 text-foreground/85">
            <p>
              She built the business on the belief that adults deserve a supplier
              they can trust — one that
              answers the phone, keeps its promises, and delivers exactly what was
              ordered.
            </p>
            <p>
              Her standard is simple: every customer is treated like a neighbour,
              and every crate must leave the warehouse in perfect condition. That
              is the promise behind every delivery we make.
            </p>
          </div>
          <img
            src={ownerImg.url}
            alt="Portrait of the owner of Glory Way Limited"
            loading="lazy"
            width={1200}
            height={1200}
            className="order-1 aspect-square w-full rounded-2xl object-cover shadow-lg lg:order-2"
          />
        </div>
      </Section>

      <Section eyebrow="What we stand for" title="Our promises">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Safety first",
              body: "Sealed products, verified drivers, and strict 18+ checks on delivery.",
            },
            {
              title: "Honest pricing",
              body: "Warehouse-direct prices with no surprise fees at the door.",
            },
            {
              title: "Always on the road",
              body: "Drivers on rotation 11 hours a day, 6 days a week across Benin City and Edo State.",
            },
          ].map((v) => {
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/80">{v.body}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
```

## `src/routes/programs.tsx`

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/section";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — Glory Way Limited drinks packages" },
      {
        name: "description",
        content:
          "Household restock, event supply, and business partner programs from Glory Way Limited. Fair prices, reliable delivery.",
      },
      { property: "og:title", content: "Glory Way Limited Programs" },
      {
        property: "og:description",
        content:
          "Household restock, event supply, and business partner programs. Fair prices, reliable delivery.",
      },
    ],
  }),
  component: ProgramsPage,
});

const programs = [
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

function ProgramsPage() {
  return (
    <div>
      <Section
        eyebrow="Programs"
        title="Simple plans for homes, events, and businesses."
        description="Pick the way you like to order. Every program comes with the same reliable phone line, verified drivers, and warehouse-direct pricing."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {programs.map((p) => {
            return (
              <article
                key={p.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="font-display text-xl font-semibold">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-primary">{p.price}</p>
                <p className="mt-3 text-sm text-foreground/80">{p.body}</p>
                <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-foreground/85">
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Enquire about {p.name}
                </Link>
              </article>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
```

## `src/routes/drinks.tsx`

```tsx
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
```

## `src/routes/address.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/section";

export const Route = createFileRoute("/address")({
  head: () => ({
    meta: [
      { title: "Address — Glory Way Limited" },
      {
        name: "description",
        content:
          "Visit the Glory Way Limited warehouse in Ikpoba Okha, Benin City, Edo State. Open 11 hours a day, 6 days a week, 365 days a year.",
      },
      { property: "og:title", content: "Glory Way Limited — Address" },
      {
        property: "og:description",
        content:
          "Warehouse in Ikpoba Okha, Benin City, Edo State. Open 11 hours a day, 6 days a week, 365 days a year.",
      },
    ],
  }),
  component: AddressPage,
});


function AddressPage() {
  return (
    <div>
      <Section
        eyebrow="Address"
        title="Come by the warehouse, or let us come to you."
        description="Walk-ins welcome for pickup, or call ahead so we have your crate waiting."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold">Warehouse</h3>
            <p className="mt-2 text-sm text-foreground/80">
              Imasabor Number 19 Oduware,<br />
              along Saple Road,<br />
              NNPC Junction, Ikpoba Okha,<br />
              Benin City, Edo State, Nigeria
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-foreground/80">
              Open 11 hours a day,<br />
              6 days a week,<br />
              365 days a year.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold">Delivery</h3>
            <p className="mt-2 text-sm text-foreground/80">
              Same-day delivery across Benin City and Edo State during opening hours. Bulk delivery available
              to neighbouring towns on request.
            </p>
          </div>
        </div>

      </Section>
    </div>
  );
}
```

## `src/routes/contact.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/section";
import { OrderForm } from "@/components/order-form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Order Enquiry — Glory Way Limited" },
      {
        name: "description",
        content:
          "Send an order enquiry to Glory Way Limited or call the warehouse. We reply within minutes during our 11-hour operating window.",
      },
      { property: "og:title", content: "Contact Glory Way Limited" },
      {
        property: "og:description",
        content:
          "Send an order enquiry or call the warehouse. We reply within minutes during our 11-hour operating window.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <Section
        eyebrow="Contact"
        title="Tell us what you need — we'll call you back."
        description="Fill in the enquiry form and a Glory Way Limited team member will confirm your drinks, price, and delivery time within minutes."
      >
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <OrderForm />
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold">
                Prefer to talk to a person?
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-foreground/85">
                <li>
                  <a href="tel:07051656621" className="hover:text-primary">
                    0705 165 6621
                  </a>
                </li>
                <li>
                  <a href="mailto:gloryomosigho@gmail.com" className="hover:text-primary">
                    gloryomosigho@gmail.com
                  </a>
                </li>
                <li>
                  <span>Imasabor Number 19 Oduware, along Saple Road, NNPC Junction, Ikpoba Okha, Benin City, Edo State, Nigeria</span>
                </li>
                <li>
                  <span>Open 11 hours a day, 6 days a week, 365 days a year</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-secondary p-6 text-secondary-foreground">
              <p className="font-display text-lg font-semibold text-primary">
                Strictly 18 +
              </p>
              <p className="mt-2 text-sm text-secondary-foreground/85">
                Our drivers verify ID at the door. Please have a valid form of
                identification ready to accept alcoholic deliveries. Drink
                responsibly.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
```

## `src/components/site-header.tsx`

```tsx
import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/drinks", label: "Drinks" },
  { to: "/address", label: "Address" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate font-display text-xl font-semibold tracking-tight">
            Glory Way Limited
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Order Now
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md px-3 py-2 text-base font-medium text-foreground/80 hover:bg-muted data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Order Now
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
```

## `src/components/site-footer.tsx`

```tsx
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold">Glory Way Limited</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-secondary-foreground/80">
            A licensed sub-distributor of Nigerian Breweries drinks serving homes and gatherings
            in Edo State. Trusted brands. Honest prices. On your doorstep.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Open 11 hours a day, 6 days a week
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/about", label: "About us" },
              { to: "/programs", label: "Programs" },
              { to: "/drinks", label: "Drinks available" },
              { to: "/address", label: "Address" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-secondary-foreground/80 hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
            Reach us
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-secondary-foreground/85">
            <li>
              <span>Imasabor Number 19 Oduware, along Saple Road, NNPC Junction, Ikpoba Okha, Edo State, Nigeria</span>
            </li>
            <li>
              <a href="tel:07051656621" className="hover:text-primary">
                0705 165 6621
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-secondary-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Glory Way Limited. All rights reserved.</p>
          <p className="font-semibold text-primary">
            Strictly for adults 18 years and above. Please drink responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

## `src/components/section.tsx`

```tsx
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
```

## `src/components/drink-card.tsx`

```tsx
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
```

## `src/components/order-form.tsx`

```tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { drinks } from "@/lib/drinks";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a reachable phone number")
    .max(20)
    .regex(/^[+()\d\s-]+$/, "Only digits and + ( ) - are allowed"),
  drink: z.string().min(1, "Choose a drink"),
  message: z.string().trim().min(5, "Tell us a bit more").max(600),
});

type FormValues = z.infer<typeof schema>;

export function OrderForm() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { drink: "" } });

  async function onSubmit(values: FormValues) {
    await new Promise((r) => setTimeout(r, 700));
    setSubmitted(values);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-secondary p-8 text-secondary-foreground">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-2xl font-semibold">
            Thank you, {submitted.name.split(" ")[0]}!
          </h3>
        </div>
        <p className="mt-4 text-secondary-foreground/85">
          We've received your enquiry for <strong className="text-primary">{
            drinks.find((d) => d.slug === submitted.drink)?.name ?? submitted.drink
          }</strong>. A Glory Way Limited team member will call you on{" "}
          <strong>{submitted.phone}</strong> within a few minutes to confirm your
          order and delivery window.
        </p>
        <p className="mt-3 text-sm text-secondary-foreground/70">
          We're open 11 hours a day, 6 days a week — expect a friendly voice, honest pricing, and a driver on
          the way soon.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(null);
          }}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <input
            {...register("name")}
            autoComplete="name"
            placeholder="Adaeze Okafor"
            className={inputCls}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone")}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+234 801 234 5678"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className={inputCls}
        />
      </Field>

      <Field label="Drink available" error={errors.drink?.message}>
        <select {...register("drink")} className={inputCls} defaultValue="">
          <option value="" disabled>
            Select a drink…
          </option>
          {drinks.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name} — {d.size}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="How many crates, delivery address, and preferred time…"
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {isSubmitting ? "Sending…" : "Send order enquiry"}
      </button>
      <p className="text-xs text-muted-foreground">
        By sending, you confirm you are 18 years or older. We never share your
        details.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
```

## `src/hooks/use-reveal.ts`

```ts
import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = "true";
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
```

## `src/lib/drinks.ts`

```ts
import maltinaFallback from "@/assets/drink-maltina.jpg";

const photos = import.meta.glob<{ url: string }>("@/assets/drinks/*.asset.json", {
  eager: true,
  import: "default",
});
const photo = (slug: string) =>
  photos[`/src/assets/drinks/${slug}.asset.json`]?.url ?? maltinaFallback;


export type Drink = {
  slug: string;
  name: string;
  category: "Lager" | "Stout" | "Malt" | "Soft Drink" | "Energy";
  brewer: string;
  size: string;
  note: string;
  image?: string;
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const make = (
  name: string,
  category: Drink["category"],
  note: string,
): Drink => ({
  slug: slugify(name),
  name,
  category,
  brewer: category,
  size: "Bottles & cans",
  note,
  image: photo(slugify(name)),
});

export const drinks: Drink[] = [
  make("Star", "Lager", "Crisp, clean Nigerian lager. Available in bottles and cans."),
  make("Gulder", "Lager", "Full-bodied lager with a smooth finish. Bottles and cans."),
  make("Heineken", "Lager", "World-class premium lager. Bottles and cans."),
  make("33 Export", "Lager", "Easy-drinking lager. Bottles and cans."),
  make("Goldberg", "Lager", "Proudly Nigerian lager. Bottles and cans."),
  make("Life", "Lager", "Refreshing lager. Bottles and cans."),
  make("Hero", "Lager", "Popular lager. Bottles and cans."),
  make("Guinness", "Stout", "Rich, dark stout. Bottles and cans."),
  make("Legend", "Stout", "Bold, smooth extra stout. Bottles and cans."),
  make("Coca-Cola", "Soft Drink", "Classic cola. Bottles and cans."),
  make("Coke Zero", "Soft Drink", "Zero-sugar cola. Bottles and cans."),
  make("Pepsi", "Soft Drink", "Refreshing cola. Bottles and cans."),
  make("7UP", "Soft Drink", "Lemon-lime soft drink. Bottles and cans."),
  make("Fanta", "Soft Drink", "Orange soft drink. Bottles and cans."),
  make("Sprite", "Soft Drink", "Lemon-lime soft drink. Bottles and cans."),
  make("Mirinda", "Soft Drink", "Fruity soft drink. Bottles and cans."),
  make("Mountain Dew", "Soft Drink", "Citrus soft drink. Bottles and cans."),
  make("Bigi", "Soft Drink", "Assorted soft drinks. Bottles and cans."),
  make("Maltina", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Malta Guinness", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Amstel Malta", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Fayrouz", "Malt", "Non-alcoholic sparkling drink. Bottles and cans."),
  make("Dubic Malt", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Malta Gold", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Hi-Malt", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Fearless", "Energy", "Energy drink. Bottles and cans."),
  make("Monster", "Energy", "Energy drink. Cans."),
  make("Predator", "Energy", "Energy drink. Bottles and cans."),
  make("Climax", "Energy", "Energy drink. Bottles and cans."),
  make("Power Horse", "Energy", "Energy drink. Cans."),
  make("Red Bull", "Energy", "Energy drink. Cans."),
  make("Trophy", "Energy", "Energy drink. Bottles and cans."),
];

export const drinkOptions = drinks.map((d) => ({ value: d.slug, label: d.name }));
```

## `src/styles.css`

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
 * Design system definition.
 *
 * The @theme inline block maps CSS custom properties to Tailwind utility
 * classes (e.g. --color-primary -> bg-primary, text-primary).
 *
 * The :root and .dark blocks define the actual color values using oklch.
 * All colors MUST use oklch format.
 *
 * To add a new semantic color:
 * 1. Add the variable to :root (light value) and .dark (dark value)
 * 2. Register it in @theme inline as --color-<name>: var(--<name>)
 */

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ring-offset-background: var(--background);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.5rem;
  /* Warm off-white paper */
  --background: oklch(0.985 0.012 95);
  /* Deep forest green ink */
  --foreground: oklch(0.24 0.05 155);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.24 0.05 155);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.24 0.05 155);
  /* Rich gold */
  --primary: oklch(0.74 0.14 82);
  --primary-foreground: oklch(0.22 0.05 155);
  /* Forest green surface */
  --secondary: oklch(0.28 0.05 155);
  --secondary-foreground: oklch(0.97 0.02 95);
  --muted: oklch(0.94 0.015 95);
  --muted-foreground: oklch(0.42 0.03 155);
  --accent: oklch(0.32 0.06 155);
  --accent-foreground: oklch(0.97 0.02 95);
  --destructive: oklch(0.55 0.22 27);
  --destructive-foreground: oklch(0.98 0.01 95);
  --border: oklch(0.88 0.02 95);
  --input: oklch(0.9 0.02 95);
  --ring: oklch(0.74 0.14 82);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.18 0.04 155);
  --foreground: oklch(0.97 0.02 95);
  --card: oklch(0.22 0.05 155);
  --card-foreground: oklch(0.97 0.02 95);
  --popover: oklch(0.22 0.05 155);
  --popover-foreground: oklch(0.97 0.02 95);
  --primary: oklch(0.78 0.14 82);
  --primary-foreground: oklch(0.18 0.04 155);
  --secondary: oklch(0.28 0.05 155);
  --secondary-foreground: oklch(0.97 0.02 95);
  --muted: oklch(0.26 0.04 155);
  --muted-foreground: oklch(0.75 0.03 95);
  --accent: oklch(0.32 0.06 155);
  --accent-foreground: oklch(0.97 0.02 95);
  --destructive: oklch(0.6 0.2 22);
  --destructive-foreground: oklch(0.98 0.01 95);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.78 0.14 82);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "ss01", "cv11";
  }

  h1, h2, h3, h4, .font-display {
    font-family: "Fraunces", ui-serif, Georgia, serif;
    letter-spacing: -0.02em;
  }
}

@utility reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 700ms ease,
    transform 700ms ease;

  &[data-visible="true"] {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## `src/lib/mcp/index.ts`

```ts
import { defineMcp } from "@lovable.dev/mcp-js";
import listDrinksTool from "./tools/list-drinks";
import getBusinessInfoTool from "./tools/get-business-info";

export default defineMcp({
  name: "glory-greens-golds",
  title: "Glory Greens & Golds",
  version: "0.1.0",
  instructions:
    "Tools for Glory Way Limited, a Nigerian Breweries sub-distributor. Use `list_drinks` to see the crate catalogue and `get_business_info` for contact details, address, and opening hours.",
  tools: [listDrinksTool, getBusinessInfoTool],
});
```

## `src/lib/mcp/tools/list-drinks.ts`

```ts
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { drinks } from "@/lib/drinks";

export default defineTool({
  name: "list_drinks",
  title: "List drinks",
  description:
    "List the Nigerian Breweries drinks Glory Way Limited stocks, optionally filtered by category. All drinks are sold by the crate.",
  inputSchema: {
    category: z
      .enum(["Lager", "Stout", "Malt", "Soft Drink", "Energy"])
      .optional()
      .describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const items = drinks
      .filter((d) => !category || d.category === category)
      .map(({ slug, name, category: c, brewer, size, note }) => ({
        slug,
        name,
        category: c,
        brewer,
        size,
        note,
        soldBy: "crate",
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { drinks: items },
    };
  },
});
```

## `src/lib/mcp/tools/get-business-info.ts`

```ts
import { defineTool } from "@lovable.dev/mcp-js";

const info = {
  name: "Glory Way Limited",
  description:
    "Licensed sub-distributor of Nigerian Breweries drinks, delivering by the crate to homes and events in Benin City and across Edo State.",
  phone: "0705 165 6621",
  email: "gloryomosigho@gmail.com",
  address:
    "Imasabor Number 19 Oduware, along Saple Road, NNPC Junction, Ikpoba Okha, Benin City, Edo State, Nigeria",
  hours: "Open 11 hours a day, 6 days a week, 365 days a year",
  soldBy: "Crates only — no single-bottle sales",
  ageRestriction: "Alcoholic drinks are sold to customers aged 18 and over only",
};

export default defineTool({
  name: "get_business_info",
  title: "Get business info",
  description:
    "Get Glory Way Limited's contact details, warehouse address, opening hours, and ordering policy.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    structuredContent: info,
  }),
});
```

## `src/router.tsx`

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
```

## `src/start.ts`

```ts
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
```

## `src/server.ts`

```ts
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
```

## `vite.config.ts`

```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  plugins: [mcpPlugin()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
```

## `package.json`

```json
{
  "name": "tanstack_start_ts",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@lovable.dev/mcp-js": "^0.26.1",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "@tanstack/router-plugin": "^1.168.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@lovable.dev/vite-tanstack-config": "2.25.3",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "nitro": "3.0.260603-beta",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.0.16"
  }
}
```