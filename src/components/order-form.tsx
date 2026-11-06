import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { drinks, type PackageType } from "@/lib/drinks";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MapPin, CheckCircle, Package } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a reachable phone number")
    .max(20)
    .regex(/^[+()\d\s-]+$/, "Only digits and + ( ) - are allowed"),
  drink: z.string().min(1, "Please choose a drink"),
  packaging: z.enum(["Bottle", "Can"], {
    required_error: "Select bottle or can",
  }),
  quantity: z
    .string()
    .trim()
    .min(1, "Please enter quantity (e.g. 5 crates or 10 packs)")
    .max(50),
  address: z
    .string()
    .trim()
    .min(5, "Please enter your delivery address")
    .max(250),
  message: z.string().trim().max(600).optional(),
});

type FormValues = z.infer<typeof schema>;

export function OrderForm() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      drink: "",
      packaging: "Bottle",
      quantity: "1 crate",
      address: "",
      message: "",
    },
  });

  const watchedDrink = watch("drink");
  const selectedDrink = drinks.find((d) => d.slug === watchedDrink);

  // Automatically adjust packaging options if drink is only available in Can or Bottle
  useEffect(() => {
    if (selectedDrink) {
      if (
        selectedDrink.packageTypes.length === 1 &&
        selectedDrink.packageTypes[0] === "Can"
      ) {
        setValue("packaging", "Can");
      } else if (
        selectedDrink.packageTypes.length === 1 &&
        selectedDrink.packageTypes[0] === "Bottle"
      ) {
        setValue("packaging", "Bottle");
      }
    }
  }, [watchedDrink, selectedDrink, setValue]);

  async function onSubmit(values: FormValues) {
    const drinkObj = drinks.find((d) => d.slug === values.drink);
    const baseName = drinkObj?.name || values.drink;
    const fullDrinkName = `${baseName} (${values.packaging})`;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("orders").insert([
          {
            customer_name: values.name,
            phone: values.phone,
            email: values.email,
            drink_slug: values.drink,
            drink_name: fullDrinkName,
            packaging: values.packaging,
            quantity: values.quantity,
            delivery_address: values.address,
            message: values.message || null,
            status: "pending",
          },
        ]);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    } else {
      // Local demo fallback
      try {
        const stored = JSON.parse(
          localStorage.getItem("glory_way_orders") || "[]",
        );
        stored.unshift({
          id: "local-" + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_name: values.name,
          phone: values.phone,
          email: values.email,
          drink_slug: values.drink,
          drink_name: fullDrinkName,
          packaging: values.packaging,
          quantity: values.quantity,
          delivery_address: values.address,
          message: values.message || null,
          status: "pending",
        });
        localStorage.setItem("glory_way_orders", JSON.stringify(stored));
      } catch (e) {
        console.error(e);
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(values);
  }

  if (submitted) {
    const drinkObj = drinks.find((d) => d.slug === submitted.drink);
    const displayName = drinkObj?.name ?? submitted.drink;
    return (
      <div className="rounded-2xl border border-primary/30 bg-secondary p-8 text-secondary-foreground shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold">
              Thank you, {submitted.name.split(" ")[0]}!
            </h3>
            <p className="text-xs text-secondary-foreground/70">
              Order enquiry received
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 rounded-xl border border-primary/20 bg-card/60 p-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span>
              <strong>Item:</strong> {submitted.quantity} of{" "}
              <strong className="text-primary">
                {displayName} ({submitted.packaging})
              </strong>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>Delivery to:</strong> {submitted.address}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-secondary-foreground/85">
          A Glory Way Limited team member will call you on{" "}
          <strong>{submitted.phone}</strong> within a few minutes to confirm your
          order rate and arrange fast delivery.
        </p>

        <p className="mt-3 text-xs text-secondary-foreground/70">
          Open 11 hours daily, 6 days a week across Benin City and Edo State.
        </p>

        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(null);
          }}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Send another order enquiry
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
        <Field label="Phone number" error={errors.phone?.message}>
          <input
            {...register("phone")}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+234 801 234 5678"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className={inputCls}
        />
      </Field>

      {/* Drink selection, Bottle/Can choice, and Quantity fields side-by-side */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Field label="Select a drink" error={errors.drink?.message}>
            <select {...register("drink")} className={inputCls} defaultValue="">
              <option value="" disabled>
                Select a drink…
              </option>
              {drinks.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-1">
          <Field label="Bottle or Can" error={errors.packaging?.message}>
            <select {...register("packaging")} className={inputCls}>
              {(!selectedDrink ||
                selectedDrink.packageTypes.includes("Bottle")) && (
                <option value="Bottle">Bottle (Crate)</option>
              )}
              {(!selectedDrink ||
                selectedDrink.packageTypes.includes("Can")) && (
                <option value="Can">Can (Pack / Carton)</option>
              )}
            </select>
          </Field>
        </div>

        <div className="sm:col-span-1">
          <Field label="Quantity" error={errors.quantity?.message}>
            <input
              {...register("quantity")}
              type="text"
              placeholder="e.g. 5 crates / 10 packs"
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Delivery Address Field */}
      <Field label="Delivery address" error={errors.address?.message}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            {...register("address")}
            placeholder="e.g. 19 along olobo, Saple Road, Ikpoba Okha, Benin City"
            className={`${inputCls} pl-9`}
          />
        </div>
      </Field>

      {/* Additional Message / Note */}
      <Field label="Additional instructions / message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={3}
          placeholder="Preferred delivery time, landmark near your location, or special requests…"
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {isSubmitting ? "Sending order enquiry…" : "Send order enquiry"}
      </button>

      <p className="text-xs text-muted-foreground">
        By sending, you confirm you are 18 years or older. We never share your details.
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
