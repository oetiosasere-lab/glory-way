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