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