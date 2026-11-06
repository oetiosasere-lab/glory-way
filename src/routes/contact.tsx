import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Section } from "@/components/section";
import { OrderForm } from "@/components/order-form";
import { getSiteSettings, defaultSiteSettings, type SiteSettings } from "@/lib/api";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

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
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

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
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-primary font-medium">
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-primary">
                    {settings.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{settings.operating_hours}</span>
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
