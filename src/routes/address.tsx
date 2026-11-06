import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Section } from "@/components/section";
import { getSiteSettings, defaultSiteSettings, type SiteSettings } from "@/lib/api";
import { MapPin, Clock, Truck } from "lucide-react";

export const Route = createFileRoute("/address")({
  head: () => ({
    meta: [
      { title: "Address — Glory Way Limited" },
      {
        name: "description",
        content:
          "Visit the Glory Way Limited warehouse at Imasabor Number 19 along olobo, Saple Road Junction, ossiomo Industrial park junction by kpoba Okha, Edo State, Nigeria.",
      },
      { property: "og:title", content: "Glory Way Limited — Address" },
      {
        property: "og:description",
        content:
          "Warehouse at Imasabor Number 19 along olobo, Saple Road Junction, ossiomo Industrial park junction by kpoba Okha, Edo State, Nigeria.",
      },
    ],
  }),
  component: AddressPage,
});

function AddressPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <div>
      <Section
        eyebrow="Address"
        title="Come by the warehouse, or let us come to you."
        description="Walk-ins welcome for pickup, or call ahead so we have your crate waiting."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Warehouse</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {settings.address}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Opening Hours</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {settings.operating_hours}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Delivery</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Same-day delivery across Benin City and Edo State during opening hours. Bulk delivery available
              to neighbouring towns on request.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
