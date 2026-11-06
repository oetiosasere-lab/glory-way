import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  supabase,
  isSupabaseConfigured,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  saveProduct,
  deleteProduct,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  getSiteSettings,
  saveSiteSettings,
  uploadProductImage,
  type Order,
  type Product,
  type Enquiry,
  type SiteSettings,
  defaultSiteSettings,
} from "@/lib/api";
import { drinks, drinkCategories, type DrinkCategory, type PackageType } from "@/lib/drinks";
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
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Upload,
  MessageSquare,
  Globe,
  Settings,
  ExternalLink,
  Check,
  X,
  Eye,
  MessageCircle,
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
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "enquiries" | "settings">("orders");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Products state
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState<string>("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productSaving, setProductSaving] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [enquiryFilter, setEnquiryFilter] = useState<string>("all");
  const [enquirySearch, setEnquirySearch] = useState("");

  // Website Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

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

  // Load data
  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    try {
      const data = await getProducts();
      setCustomProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadEnquiries() {
    setEnquiriesLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setEnquiriesLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const data = await getSiteSettings();
      setSiteSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadProducts(), loadEnquiries(), loadSettings()]);
    setRefreshing(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();

      // Realtime subscription if Supabase is connected
      if (isSupabaseConfigured()) {
        const orderChannel = supabase
          .channel("admin-orders-sync")
          .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
            loadOrders();
          })
          .subscribe();

        const productChannel = supabase
          .channel("admin-products-sync")
          .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
            loadProducts();
          })
          .subscribe();

        const enquiryChannel = supabase
          .channel("admin-enquiries-sync")
          .on("postgres_changes", { event: "*", schema: "public", table: "enquiries" }, () => {
            loadEnquiries();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(orderChannel);
          supabase.removeChannel(productChannel);
          supabase.removeChannel(enquiryChannel);
        };
      }
    }
  }, [isAuthenticated]);

  // Order status update
  async function handleUpdateOrderStatus(id: string, status: Order["status"]) {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status, completed_at: status === "completed" ? new Date().toISOString() : null }
            : o
        )
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert("Failed to delete order: " + err.message);
    }
  }

  // Combined product list (built-in catalog + custom products added by seller)
  const allProducts = useMemo(() => {
    const catalogFormatted: Product[] = drinks.map((d) => ({
      id: `builtin-${d.slug}`,
      slug: d.slug,
      name: d.name,
      category: d.category,
      package_types: d.packageTypes,
      brewer: d.brewer,
      size: d.size,
      note: d.note,
      image_url: d.image || null,
      in_stock: true,
      price: "By Crate/Pack",
    }));

    // Merge: custom products override or append
    const customSlugs = new Set(customProducts.map((p) => p.slug));
    const merged = [
      ...customProducts,
      ...catalogFormatted.filter((p) => !customSlugs.has(p.slug)),
    ];
    return merged;
  }, [customProducts]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.drink_name.toLowerCase().includes(q) ||
        (o.delivery_address && o.delivery_address.toLowerCase().includes(q)) ||
        (o.message && o.message.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat = productCatFilter === "all" || p.category === productCatFilter;
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brewer.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allProducts, productCatFilter, productSearch]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchStatus = enquiryFilter === "all" || e.status === enquiryFilter;
      const q = enquirySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [enquiries, enquiryFilter, enquirySearch]);

  // Handle Save Product
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setProductSaving(true);
    try {
      const slug =
        editingProduct.slug ||
        editingProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const productPayload = {
        name: editingProduct.name,
        slug,
        category: editingProduct.category || "Soft Drink",
        package_types: editingProduct.package_types || ["Can"],
        brewer: editingProduct.brewer || "Glory Way Stock",
        size: editingProduct.size || "Standard",
        price: editingProduct.price || "Contact for price",
        note: editingProduct.note || "",
        image_url: editingProduct.image_url || null,
        in_stock: editingProduct.in_stock ?? true,
      };

      const saved = await saveProduct(
        editingProduct.id && !editingProduct.id.startsWith("builtin-")
          ? { ...productPayload, id: editingProduct.id }
          : productPayload
      );

      setCustomProducts((prev) => {
        const index = prev.findIndex((p) => p.slug === saved.slug || p.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert("Error saving product: " + err.message);
    } finally {
      setProductSaving(false);
    }
  }

  // Handle Delete Product
  async function handleDeleteProduct(p: Product) {
    if (!confirm(`Are you sure you want to delete ${p.name}?`)) return;
    try {
      await deleteProduct(p.id);
      setCustomProducts((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    }
  }

  // Save Website Settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await saveSiteSettings(siteSettings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSettingsSaving(false);
    }
  }

  // If not authenticated, show PIN screen
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
              Enter your seller PIN to access orders, products, and website controls.
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
            Default PIN is <strong>1234</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                Glory Way Admin
              </span>
              {!isSupabaseConfigured() && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Supabase Key Needed
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Seller Management Center
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage incoming customer orders, update drinks catalog, respond to enquiries, and edit website info.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              View Storefront
            </Link>

            <button
              onClick={refreshAll}
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

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-border/80 pb-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Customer Orders
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === "orders" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {orderCounts.all}
            </span>
            {orderCounts.pending > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "products"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Edit2 className="h-4 w-4" />
            Products & Catalog
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === "products" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {allProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("enquiries")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "enquiries"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Customer Enquiries
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === "enquiries" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {enquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Website Information
          </button>
        </div>

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 1: CUSTOMER ORDERS */}
        {/* -------------------------------------------------------------------------------- */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-6">
            {/* Orders Metrics Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    All Orders
                  </span>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 font-display text-3xl font-bold">{orderCounts.all}</p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {orderCounts.pending}
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
                  {orderCounts.confirmed}
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
                  {orderCounts.completed}
                </p>
              </div>
            </div>

            {/* Orders Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1">
                {[
                  { id: "all", label: "All", count: orderCounts.all },
                  { id: "pending", label: "Pending", count: orderCounts.pending },
                  { id: "confirmed", label: "Confirmed", count: orderCounts.confirmed },
                  { id: "completed", label: "Completed", count: orderCounts.completed },
                  { id: "cancelled", label: "Cancelled", count: orderCounts.cancelled },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      orderStatusFilter === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="relative min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer, phone, drink, address…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {ordersLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 font-display text-lg font-semibold">No orders found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {orderSearch
                      ? "Try adjusting your search query."
                      : "New orders submitted on the landing page will appear here immediately."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const isCompleted = order.status === "completed";
                    const isPending = order.status === "pending";
                    const isConfirmed = order.status === "confirmed";

                    // Clean phone number for WhatsApp link
                    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
                    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "234" + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                      `Hello ${order.customer_name}, this is Glory Way Limited regarding your order for ${order.quantity} of ${order.drink_name}.`
                    )}`;

                    return (
                      <div
                        key={order.id}
                        className={`p-6 transition-colors hover:bg-muted/30 ${
                          isCompleted ? "opacity-90 bg-muted/10" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3 flex-1">
                            {/* Customer & Status Header */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-display text-lg font-bold text-foreground">
                                {order.customer_name}
                              </span>

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

                              {order.completed_at && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  ✓ Completed {new Date(order.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>

                            {/* Drink & Packaging details */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                {order.quantity}
                              </span>
                              <span className="text-sm font-semibold text-foreground">
                                {order.drink_name}
                              </span>
                              {order.packaging && (
                                <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                  {order.packaging}
                                </span>
                              )}
                            </div>

                            {/* Delivery Address */}
                            {order.delivery_address && (
                              <div className="flex items-start gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-2.5 text-xs text-foreground">
                                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <div>
                                  <span className="font-semibold text-foreground/70">Delivery Address: </span>
                                  <span className="font-medium text-foreground">{order.delivery_address}</span>
                                </div>
                              </div>
                            )}

                            {/* Contact Links */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <a
                                href={`tel:${order.phone}`}
                                className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
                              >
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                {order.phone}
                              </a>

                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp Customer
                              </a>

                              <a
                                href={`mailto:${order.email}`}
                                className="inline-flex items-center gap-1.5 hover:text-primary"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {order.email}
                              </a>
                            </div>

                            {/* Customer Note */}
                            {order.message && (
                              <div className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground/90">
                                <span className="font-semibold text-foreground/60">Customer Note: </span>
                                {order.message}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 lg:pt-0">
                            {isPending && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                              >
                                Mark Confirmed
                              </button>
                            )}

                            {!isCompleted && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Mark Completed
                              </button>
                            )}

                            {isCompleted && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "pending")}
                                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                              >
                                Re-open
                              </button>
                            )}

                            {order.status !== "cancelled" && !isCompleted && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center p-1.5 text-muted-foreground hover:text-destructive"
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* -------------------------------------------------------------------------------- */}
        {activeTab === "products" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">Drinks & Products Catalog</h2>
                <p className="text-xs text-muted-foreground">
                  Add new drinks, edit package options (bottle/can), update descriptions, and upload bottle/can pictures.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: "",
                    slug: "",
                    category: "Soft Drink",
                    package_types: ["Can"],
                    brewer: "Glory Way Stock",
                    size: "Standard",
                    price: "By Crate",
                    note: "",
                    in_stock: true,
                    image_url: "",
                  });
                  setIsProductModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Add New Product
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {["all", ...drinkCategories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCatFilter(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      productCatFilter === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search product name, brewer…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => {
                const isCustom = !p.id.startsWith("builtin-");

                return (
                  <div
                    key={p.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted/30">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                          <Package className="h-12 w-12" />
                        </div>
                      )}

                      <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm">
                        {p.category}
                      </span>

                      {isCustom && (
                        <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="mt-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-display font-bold text-base text-foreground leading-tight">
                            {p.name}
                          </h3>
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground">{p.brewer}</p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.package_types.map((pkg) => (
                            <span
                              key={pkg}
                              className="rounded border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary"
                            >
                              {pkg}
                            </span>
                          ))}
                        </div>

                        {p.size && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            <span className="font-semibold text-foreground/70">Sizes:</span> {p.size}
                          </p>
                        )}

                        {p.note && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {p.note}
                          </p>
                        )}
                      </div>

                      {/* Product Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-semibold text-primary">
                          {p.price || "Contact for price"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {isCustom && (
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="rounded-lg border border-destructive/20 p-1.5 text-destructive hover:bg-destructive/10"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 3: CUSTOMER ENQUIRIES */}
        {/* -------------------------------------------------------------------------------- */}
        {activeTab === "enquiries" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">Customer Enquiries</h2>
                <p className="text-xs text-muted-foreground">
                  View and manage messages sent from customers inquiring about drink availability, pricing, or custom events.
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer, email, message…"
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Enquiries Filter */}
            <div className="flex gap-2">
              {["all", "unread", "read", "replied"].map((status) => (
                <button
                  key={status}
                  onClick={() => setEnquiryFilter(status)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    enquiryFilter === status
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Enquiries List */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {enquiriesLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="py-16 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 font-display text-lg font-semibold">No enquiries found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enquiries submitted via the Contact page will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredEnquiries.map((enq) => (
                    <div key={enq.id} className="p-6 transition-colors hover:bg-muted/30">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-base text-foreground">
                              {enq.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                enq.status === "unread"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                                  : enq.status === "replied"
                                  ? "bg-emerald-500/15 text-emerald-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {enq.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(enq.created_at).toLocaleString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <a href={`mailto:${enq.email}`} className="hover:text-primary">
                              {enq.email}
                            </a>
                            {enq.phone && (
                              <a href={`tel:${enq.phone}`} className="hover:text-primary">
                                {enq.phone}
                              </a>
                            )}
                          </div>

                          <div className="mt-2 rounded-lg bg-muted/40 p-3 text-sm text-foreground">
                            {enq.message}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${enq.email}?subject=Re: Glory Way Drinks Enquiry`}
                            onClick={() => updateEnquiryStatus(enq.id, "replied")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Reply by Email
                          </a>

                          {enq.status === "unread" && (
                            <button
                              onClick={async () => {
                                await updateEnquiryStatus(enq.id, "read");
                                setEnquiries((prev) =>
                                  prev.map((e) => (e.id === enq.id ? { ...e, status: "read" } : e))
                                );
                              }}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            >
                              Mark Read
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              if (!confirm("Delete this enquiry?")) return;
                              await deleteEnquiry(enq.id);
                              setEnquiries((prev) => prev.filter((e) => e.id !== enq.id));
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------------- */}
        {/* TAB 4: UPDATE WEBSITE INFORMATION */}
        {/* -------------------------------------------------------------------------------- */}
        {activeTab === "settings" && (
          <div className="mt-6 max-w-3xl space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold">Update Website Information</h2>
              <p className="text-xs text-muted-foreground">
                Edit contact details, warehouse location, operating hours, and customer announcements shown across the website.
              </p>
            </div>

            {settingsSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Website information successfully saved and updated!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warehouse Phone Number
                </label>
                <input
                  type="text"
                  value={siteSettings.phone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  placeholder="e.g. 0705 165 6621"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={siteSettings.email}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  placeholder="e.g. gloryomosigho@gmail.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warehouse Physical Address
                </label>
                <textarea
                  rows={3}
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  placeholder="e.g. Imasabor Number 19 Oduware, along Sapele Road..."
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Operating Hours / Schedule
                </label>
                <input
                  type="text"
                  value={siteSettings.operating_hours}
                  onChange={(e) => setSiteSettings({ ...siteSettings, operating_hours: e.target.value })}
                  placeholder="e.g. Open 11 hours a day, 6 days a week, 365 days a year"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Top Announcement / Notice Banner
                </label>
                <input
                  type="text"
                  value={siteSettings.announcement}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                  placeholder="e.g. Chilled drinks ready for bulk delivery across Benin City."
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {settingsSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving changes…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Website Information
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------------- */}
      {/* PRODUCT ADD / EDIT MODAL */}
      {/* -------------------------------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-lg font-bold">
                {editingProduct.id ? `Edit ${editingProduct.name || "Product"}` : "Add New Drink"}
              </h2>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Drink Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Origin Zero, Goldberg Can"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category || "Soft Drink"}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as DrinkCategory,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {drinkCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brewer / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brewer || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brewer: e.target.value })}
                    placeholder="e.g. Nigerian Breweries, Guinness"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Packaging Types Selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Packaging Options Available *
                </label>
                <div className="mt-2 flex gap-4">
                  {(["Bottle", "Can"] as PackageType[]).map((pkg) => {
                    const isChecked = editingProduct.package_types?.includes(pkg);
                    return (
                      <label
                        key={pkg}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = editingProduct.package_types || [];
                            if (e.target.checked) {
                              setEditingProduct({
                                ...editingProduct,
                                package_types: [...current, pkg],
                              });
                            } else {
                              if (current.length <= 1) return; // Must have at least 1
                              setEditingProduct({
                                ...editingProduct,
                                package_types: current.filter((p) => p !== pkg),
                              });
                            }
                          }}
                        />
                        {isChecked ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 rounded border border-border" />}
                        {pkg}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sizes & Packaging Info
                  </label>
                  <input
                    type="text"
                    value={editingProduct.size || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    placeholder="e.g. 33cl Cans / 60cl Bottles"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price Note
                  </label>
                  <input
                    type="text"
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    placeholder="e.g. ₦12,500 / crate or By Crate"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Product Picture Upload */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Picture
                </label>
                <div className="mt-1.5 flex items-center gap-4">
                  {editingProduct.image_url ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
                      <img
                        src={editingProduct.image_url}
                        alt="Preview"
                        className="h-full w-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image_url: "" })}
                        className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-destructive hover:bg-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 text-xs font-semibold text-primary">
                        Upload bottle/can image
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        PNG, JPG or WebP (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadProductImage(file);
                              setEditingProduct({ ...editingProduct, image_url: url });
                            } catch (err: any) {
                              alert("Failed to upload image: " + err.message);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={editingProduct.image_url || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description / Tasting Note
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.note || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, note: e.target.value })}
                  placeholder="Brief description of the drink and taste..."
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={productSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {productSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
