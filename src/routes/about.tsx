import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/section";
import warehouseImg from "@/assets/warehouse.jpg";
import ownerImg from "@/assets/owner.jpg";

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

      <Section
        eyebrow="Meet the owner"
        title="The person behind the crates."
        className="pt-0 lg:pt-0"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-display text-2xl font-semibold text-foreground">
              Built on trust, verified delivery, and family care.
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/85">
              She built Glory Way Limited on the firm belief that customers deserve a supplier
              they can depend on — one that answers the phone promptly, keeps its promises,
              and delivers exactly what was ordered.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/85">
              Her standard is simple: every customer is treated like a neighbour,
              and every crate must leave the warehouse chilled and in perfect condition. That
              is the personal guarantee behind every delivery across Edo State.
            </p>
            <div className="pt-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground text-sm">12+ Years</span>
                <p>Serving Benin City</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="font-semibold text-foreground text-sm">100% Licensed</span>
                <p>Authentic Drinks Only</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <img
              src={ownerImg}
              alt="Portrait of the owner of Glory Way Limited"
              loading="lazy"
              width={800}
              height={900}
              className="aspect-[4/5] max-w-sm sm:max-w-md w-full rounded-2xl object-cover shadow-xl border border-border"
            />
          </div>
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