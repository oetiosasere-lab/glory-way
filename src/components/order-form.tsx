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