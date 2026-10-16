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