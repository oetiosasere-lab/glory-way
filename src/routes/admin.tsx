import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  supabase,
  isSupabaseConfigured,
  type Order,
} from "@/lib/supabase";
import {
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Package,
  Search,
  RefreshCw,
  Lock,
  LogOut,
  AlertCircle,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Seller Admin Dashboard — Glory Way Limited" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const DEFAULT_PIN = "1234";

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("glory_admin_auth") === "true";
    }
    return false;
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Authentication check
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("glory_admin_auth", "true");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Default PIN is 1234.");
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    sessionStorage.removeItem("glory_admin_auth");
  }

  // Fetch orders from Supabase (or localStorage fallback)
  async function fetchOrders() {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else if (data) {
          setOrders(data as Order[]);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    } else {
      // LocalStorage demo fallback
      try {
        const local = JSON.parse(
          localStorage.getItem("glory_way_orders") || "[]",
        );
        if (local.length > 0) {
          setOrders(local);
        } else {
          // Starter demo orders
          const sampleOrders: Order[] = [
            {
              id: "sample-1",
              created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
              updated_at: new Date().toISOString(),
              customer_name: "Osasere Test",
              phone: "+234 801 234 5678",
              email: "osasere@example.com",
              drink_slug: "star",
              drink_name: "Star Lager",
              quantity: "5 crates",
              message: "Please deliver along Sapele Road NNPC Junction by 3 PM.",
              status: "pending",
            },
            {
              id: "sample-2",
              created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              updated_at: new Date().toISOString(),
              customer_name: "Efe Johnson",
              phone: "+234 802 345 6789",
              email: "efe@example.com",
              drink_slug: "heineken",
              drink_name: "Heineken",
              quantity: "10 crates",
              message: "Wedding gathering restock. Call driver on arrival.",
              status: "confirmed",
            },
            {
              id: "sample-3",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              updated_at: new Date().toISOString(),
              customer_name: "Blessing Amadasun",
              phone: "+234 803 456 7890",
              email: "blessing@example.com",
              drink_slug: "malta-guinness",
              drink_name: "Malta Guinness",
              quantity: "3 crates",
              message: "Delivered and paid in cash. Excellent service.",
              status: "completed",
              completed_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            },
          ];
          setOrders(sampleOrders);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }

  // Update order status
  async function updateStatus(orderId: string, newStatus: Order["status"]) {
    setRefreshing(true);
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  completed_at:
                    newStatus === "completed" ? new Date().toISOString() : null,
                }
              : o,
          ),
        );
      } else {
        alert("Could not update status: " + error.message);
      }
    } else {
      // Local update
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                completed_at:
                  newStatus === "completed" ? new Date().toISOString() : null,
              }
            : o,
        );
        localStorage.setItem("glory_way_orders", JSON.stringify(next));
        return next;
      });
    }
    setRefreshing(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();

      // Setup Realtime if Supabase is connected
      if (isSupabaseConfigured()) {
        const channel = supabase
          .channel("realtime-orders")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            () => {
              fetchOrders();
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isAuthenticated]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.drink_name.toLowerCase().includes(q) ||
        (o.message && o.message.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // If not logged in, render PIN screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Seller Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your seller PIN to manage incoming drink orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seller PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: 1234)"
                autoFocus
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {pinError && (
                <p className="mt-2 text-xs font-medium text-destructive">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5"
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Default PIN is <strong>1234</strong>. You can change this in <code>src/routes/admin.tsx</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                Seller Dashboard
              </span>
              {!isSupabaseConfigured() && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Supabase Key Needed
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Orders Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review who ordered drinks, confirm delivery windows, and track completed orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchOrders().then(() => setRefreshing(false));
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-muted"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Lock
            </button>
          </div>
        </div>

        {/* Supabase Notice Banner if not configured */}
        {!isSupabaseConfigured() && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold">Connect your Supabase Database</p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  Your Supabase project URL (<code>https://voljkpxdcjotkbdbwyvk.supabase.co</code>) is set up.
                  To save orders permanently in cloud PostgreSQL, run the SQL in <code>supabase/schema.sql</code> in your Supabase dashboard and add your <strong>anon key</strong> to <code>.env</code>. Currently showing local demo orders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All Orders
              </span>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{counts.all}</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending Action
              </span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-amber-600 dark:text-amber-400">
              {counts.pending}
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Confirmed
              </span>
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-blue-600 dark:text-blue-400">
              {counts.confirmed}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Completed
              </span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {counts.completed}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1">
            {[
              { id: "all", label: "All", count: counts.all },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "confirmed", label: "Confirmed", count: counts.confirmed },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "cancelled", label: "Cancelled", count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customer, phone, drink…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Orders List / Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-display text-lg font-semibold">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? "Try adjusting your search query." : "New orders will appear here as customers order on the landing page."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const isCompleted = order.status === "completed";
                const isPending = order.status === "pending";
                const isConfirmed = order.status === "confirmed";

                return (
                  <div
                    key={order.id}
                    className={`p-6 transition-colors hover:bg-muted/30 ${
                      isCompleted ? "opacity-90" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Customer & Drink Info */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-display text-lg font-semibold text-foreground">
                            {order.customer_name}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : isConfirmed
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                : isCompleted
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-500/15 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {order.status}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString("en-NG", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Drink & Quantity details */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {order.quantity}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {order.drink_name}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <a
                            href={`tel:${order.phone}`}
                            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
                          >
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            {order.phone}
                          </a>
                          <a
                            href={`mailto:${order.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-primary"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {order.email}
                          </a>
                        </div>

                        {/* Customer note / delivery message */}
                        {order.message && (
                          <div className="max-w-2xl rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground/90">
                            <span className="font-semibold text-foreground/60">Note: </span>
                            {order.message}
                          </div>
                        )}
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 lg:pt-0">
                        {isPending && (
                          <button
                            onClick={() => updateStatus(order.id, "confirmed")}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                          >
                            Mark Confirmed
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => updateStatus(order.id, "completed")}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Mark Completed
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => updateStatus(order.id, "pending")}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            Re-open
                          </button>
                        )}

                        {order.status !== "cancelled" && !isCompleted && (
                          <button
                            onClick={() => updateStatus(order.id, "cancelled")}
                            className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
