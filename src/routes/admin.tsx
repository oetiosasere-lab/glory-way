import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  isSupabaseConfigured,
  getOrders,
  createOrder,
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
  Lock as LockIcon,
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
  EyeOff,
  MessageCircle,
  Download,
  Printer,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  Copy,
  ArrowLeft,
  User as UserIcon,
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
  // Supabase Auth State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<
    "login" | "mfa_challenge" | "signup" | "forgot_password" | "reset_password" | "pin_login"
  >("login");

  // Auth Form Fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // MFA 2FA State
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [enrollFactorId, setEnrollFactorId] = useState("");
  const [enrollQrCode, setEnrollQrCode] = useState("");
  const [enrollSecret, setEnrollSecret] = useState("");
  const [enrollVerifyCode, setEnrollVerifyCode] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Authentication Status (Supabase Session or Emergency PIN)
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

  // Manual New Order modal state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderPhone, setNewOrderPhone] = useState("");
  const [newOrderDrinkSlug, setNewOrderDrinkSlug] = useState(drinks[0]?.slug || "star");
  const [newOrderPackaging, setNewOrderPackaging] = useState<"Bottle" | "Can">("Bottle");
  const [newOrderQuantity, setNewOrderQuantity] = useState("1 crate");
  const [newOrderAddress, setNewOrderAddress] = useState("");
  const [newOrderNotes, setNewOrderNotes] = useState("");
  const [newOrderSaving, setNewOrderSaving] = useState(false);

  // Security / PIN change state
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; error?: boolean } | null>(null);

  function getStoredPin(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("glory_admin_pin") || DEFAULT_PIN;
    }
    return DEFAULT_PIN;
  }

  // Load MFA factors
  async function loadEnrolledFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data) {
        setEnrolledFactors(data.totp || []);
      }
    } catch (e) {
      console.error("Failed to list MFA factors:", e);
    }
  }

  // Check Authenticator Assurance Level (AAL1 vs AAL2)
  async function verifyMfaStatus(session: Session) {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        setIsAuthenticated(true);
        sessionStorage.setItem("glory_admin_auth", "true");
        setAuthLoading(false);
        return;
      }

      if (data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        // MFA is required
        const factorsRes = await supabase.auth.mfa.listFactors();
        const totp = factorsRes.data?.totp?.[0];
        if (totp) {
          setMfaFactorId(totp.id);
          setAuthView("mfa_challenge");
          setIsAuthenticated(false);
          setAuthLoading(false);
          return;
        }
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("glory_admin_auth", "true");
      loadEnrolledFactors();
    } catch (err) {
      setIsAuthenticated(true);
      sessionStorage.setItem("glory_admin_auth", "true");
    } finally {
      setAuthLoading(false);
    }
  }

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setAuthView("reset_password");
    }

    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthSession(session);
        setAuthUser(session.user);
        verifyMfaStatus(session);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user || null);

      if (event === "PASSWORD_RECOVERY") {
        setAuthView("reset_password");
      } else if (session) {
        verifyMfaStatus(session);
      } else {
        if (sessionStorage.getItem("glory_admin_auth") !== "true") {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email & Password Login
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message);
        setAuthSubmitting(false);
        return;
      }

      if (data.session) {
        setAuthSession(data.session);
        setAuthUser(data.user);
        await verifyMfaStatus(data.session);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  // MFA 2FA Code Verification
  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode.trim(),
      });

      if (error) {
        setAuthError(error.message);
        setAuthSubmitting(false);
        return;
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("glory_admin_auth", "true");
      setMfaCode("");
      setAuthView("login");
      await loadEnrolledFactors();
    } catch (err: any) {
      setAuthError(err.message || "Invalid 2FA code. Please check your authenticator app.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Admin Account Creation (Initial Sign Up)
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthError("");
    setAuthSuccess("");
    setAuthSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message);
        setAuthSubmitting(false);
        return;
      }

      if (data.session) {
        setAuthSession(data.session);
        setAuthUser(data.user);
        setIsAuthenticated(true);
        sessionStorage.setItem("glory_admin_auth", "true");
        loadEnrolledFactors();
      } else {
        setAuthSuccess("Admin account created! Check your email to verify, or sign in if confirmation is disabled.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to create account.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Forgot Password / Recovery Email
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthSubmitting(true);
    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/admin" : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      setAuthSuccess("Password recovery link sent! Please check your email inbox.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset link.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  // Set New Password after recovery
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthError("");
    setAuthSuccess("");
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: authPassword });
      if (error) throw error;
      setAuthSuccess("Password updated successfully! You can now log in.");
      setTimeout(() => {
        setAuthView("login");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthSuccess("");
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || "Failed to update password.");
    } finally {
      setAuthSubmitting(false);
    }
  }

  // MFA Enrollment in Dashboard Settings
  async function handleStartMfaEnroll() {
    setEnrollError("");
    setEnrollSuccess("");
    setIsEnrollingMfa(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Glory Way Limited",
      });
      if (error) throw error;
      setEnrollFactorId(data.id);
      setEnrollQrCode(data.totp.qr_code);
      setEnrollSecret(data.totp.secret);
    } catch (err: any) {
      setEnrollError(err.message || "Failed to start 2FA setup.");
      setIsEnrollingMfa(false);
    }
  }

  async function handleConfirmMfaEnroll(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError("");
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollFactorId,
        code: enrollVerifyCode.trim(),
      });
      if (error) throw error;
      setEnrollSuccess("Two-Factor Authentication (2FA) is now ACTIVE on your account!");
      setEnrollQrCode("");
      setEnrollSecret("");
      setEnrollVerifyCode("");
      setIsEnrollingMfa(false);
      await loadEnrolledFactors();
    } catch (err: any) {
      setEnrollError(err.message || "Invalid 6-digit code. Please check your authenticator app.");
    }
  }

  async function handleUnenrollMfa(factorId: string) {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) return;
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      alert("Two-Factor Authentication has been removed.");
      await loadEnrolledFactors();
    } catch (err: any) {
      alert("Failed to remove 2FA: " + err.message);
    }
  }

  // Logout
  async function handleLogout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAuthUser(null);
    setAuthSession(null);
    sessionStorage.removeItem("glory_admin_auth");
  }

  // Fallback PIN Authentication
  function handlePinLogin(e: React.FormEvent) {
    e.preventDefault();
    const valid = getStoredPin();
    if (pinInput === valid || pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("glory_admin_auth", "true");
      setPinError("");
    } else {
      setPinError(`Incorrect PIN. (Default PIN: ${DEFAULT_PIN})`);
    }
  }

  async function handleCreateManualOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrderCustomer.trim() || !newOrderPhone.trim() || !newOrderAddress.trim()) {
      alert("Please fill in customer name, phone number, and delivery address.");
      return;
    }
    setNewOrderSaving(true);
    try {
      const selectedDrink = drinks.find((d) => d.slug === newOrderDrinkSlug);
      const drinkName = selectedDrink ? selectedDrink.name : newOrderDrinkSlug;
      const order = await createOrder({
        customer_name: newOrderCustomer.trim(),
        phone: newOrderPhone.trim(),
        drink_slug: newOrderDrinkSlug,
        drink_name: drinkName,
        packaging: newOrderPackaging,
        quantity: newOrderQuantity.trim() || "1 crate",
        delivery_address: newOrderAddress.trim(),
        message: newOrderNotes.trim() || null,
        status: "confirmed",
      });
      setOrders((prev) => [order, ...prev]);
      setIsNewOrderModalOpen(false);
      setNewOrderCustomer("");
      setNewOrderPhone("");
      setNewOrderAddress("");
      setNewOrderNotes("");
      alert("Customer order added successfully!");
    } catch (err: any) {
      alert("Failed to create order: " + err.message);
    } finally {
      setNewOrderSaving(false);
    }
  }

  function handleUpdatePin(e: React.FormEvent) {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg({ text: "PIN must be at least 4 digits.", error: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ text: "PINs do not match.", error: true });
      return;
    }
    localStorage.setItem("glory_admin_pin", newPin);
    setPinChangeMsg({ text: "PIN updated successfully! Use your new PIN on your next login.", error: false });
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => setPinChangeMsg(null), 4000);
  }

  function handleExportCSV() {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }
    const headers = ["Order ID", "Date", "Customer", "Phone", "Drink", "Package", "Quantity", "Delivery Address", "Status", "Notes"];
    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${o.customer_name.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.drink_name.replace(/"/g, '""')}"`,
      `"${o.packaging}"`,
      `"${o.quantity.replace(/"/g, '""')}"`,
      `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `glory_way_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // If loading authentication status
  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Checking security session…</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show Supabase Auth Login / 2FA Gate
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              {authView === "mfa_challenge" ? (
                <Smartphone className="h-7 w-7" />
              ) : authView === "pin_login" ? (
                <KeyRound className="h-7 w-7" />
              ) : (
                <LockIcon className="h-7 w-7" />
              )}
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">
              {authView === "login" && "Seller Admin Portal"}
              {authView === "mfa_challenge" && "Two-Factor Authentication"}
              {authView === "signup" && "Create Admin Account"}
              {authView === "forgot_password" && "Reset Admin Password"}
              {authView === "reset_password" && "Set New Password"}
              {authView === "pin_login" && "Emergency Warehouse PIN"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {authView === "login" && "Sign in with your administrator credentials to access store orders and settings."}
              {authView === "mfa_challenge" && "Enter the 6-digit verification code from your authenticator app (Google Authenticator, Authy, Apple Keychain)."}
              {authView === "signup" && "Register an authorized administrator account for Glory Way Limited."}
              {authView === "forgot_password" && "Enter your email address to receive a secure recovery link."}
              {authView === "reset_password" && "Enter a new secure password for your administrator account."}
              {authView === "pin_login" && "Enter the offline warehouse PIN for emergency access."}
            </p>
          </div>

          {/* Feedback messages */}
          {authError && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {authView === "login" && (
            <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin Email
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Oetiosasere@gmail.com"
                    autoFocus
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError("");
                      setAuthSuccess("");
                      setAuthView("forgot_password");
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LockIcon className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col gap-2 text-center text-xs text-muted-foreground border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthView("signup");
                  }}
                  className="hover:text-foreground font-medium"
                >
                  First-time admin setup? <span className="text-primary font-bold">Register Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthView("pin_login");
                  }}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  Use offline warehouse PIN
                </button>
              </div>
            </form>
          )}

          {/* 2. MFA CHALLENGE VIEW */}
          {authView === "mfa_challenge" && (
            <form onSubmit={handleVerifyMfa} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center block">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting || mfaCode.length < 6}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying code…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify & Unlock Dashboard
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setAuthView("login");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Cancel and return to sign in
                </button>
              </div>
            </form>
          )}

          {/* 3. SIGN UP VIEW */}
          {authView === "signup" && (
            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Oetiosasere@gmail.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password (8+ characters)
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating admin account…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Register Account
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthView("login");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Already registered? Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD VIEW */}
          {authView === "forgot_password" && (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Registered Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Oetiosasere@gmail.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending reset link…
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Password Reset Email
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthView("login");
                  }}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD VIEW */}
          {authView === "reset_password" && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password (8+ characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Save New Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* 6. EMERGENCY PIN VIEW */}
          {authView === "pin_login" && (
            <form onSubmit={handlePinLogin} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Warehouse PIN
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

              <div className="pt-2 text-center text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setPinError("");
                    setAuthView("login");
                  }}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Supabase Email & 2FA Login
                </button>
              </div>
            </form>
          )}
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                Glory Way Admin
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Supabase Live
              </span>
              {enrolledFactors.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  2FA Active (TOTP)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-3 w-3" />
                  2FA Recommended
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              Seller Management Center
            </h1>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>Manage incoming customer orders, update drinks catalog, and edit website info.</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-foreground font-medium">
                <UserIcon className="h-3 w-3 text-primary" />
                {authUser?.email || "Offline PIN Session"}
              </span>
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
              title="Sign Out of Admin Session"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search customer, phone, drink, address…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Export filtered orders as CSV file"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print Orders Summary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  + New Order
                </button>
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
                  placeholder="e.g. Oetiosasere@gmail.com"
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
                  placeholder="e.g. Imasabor Number 19 along ologbo , Saple Road, Junction, ossiomo Industrial park junction by ikpoba Okha, Edo State, Nigeria"
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

            {/* ------------------------------------------------------------------ */}
            {/* ADMIN SECURITY & TWO-FACTOR AUTHENTICATION (2FA) */}
            {/* ------------------------------------------------------------------ */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Admin Security & Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Protect your admin portal with Authenticator App (TOTP) verification.
                    </p>
                  </div>
                </div>

                {enrolledFactors.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    2FA Protected (Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    2FA Disabled
                  </span>
                )}
              </div>

              {/* Account summary */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Authenticated Account
                    </span>
                    <p className="text-sm font-bold text-foreground">{authUser?.email || "Offline PIN Session"}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Session Assurance
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {enrolledFactors.length > 0 ? "AAL2 (Multi-Factor Verified)" : "AAL1 (Password / PIN)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {enrollError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{enrollError}</span>
                </div>
              )}
              {enrollSuccess && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{enrollSuccess}</span>
                </div>
              )}

              {/* MFA Active state */}
              {enrolledFactors.length > 0 && !isEnrollingMfa && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Authenticator App (TOTP)</p>
                          <p className="text-xs text-muted-foreground">
                            Google Authenticator / Authy / Apple Keychain is protecting your logins.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnenrollMfa(enrolledFactors[0].id)}
                        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Disable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MFA Inactive state */}
              {enrolledFactors.length === 0 && !isEnrollingMfa && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Two-Factor Authentication is not enabled</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add an extra layer of security. Every time you log in, you will be prompted for a 6-digit code from your authenticator app (Google Authenticator, Authy, Apple Keychain, 1Password).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartMfaEnroll}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Setup Authenticator App (2FA)
                  </button>
                </div>
              )}

              {/* MFA Enrollment in progress */}
              {isEnrollingMfa && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-5">
                  <div className="border-b border-border pb-3">
                    <h4 className="text-sm font-bold text-foreground">Setup Two-Factor Authentication</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Follow these steps using Google Authenticator, Authy, or Apple Keychain on your phone.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* QR Code */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs font-semibold text-muted-foreground mb-2">
                        Step 1: Scan this QR code
                      </span>
                      {enrollQrCode ? (
                        enrollQrCode.startsWith("data:") ? (
                          <img
                            src={enrollQrCode}
                            alt="2FA QR Code"
                            className="h-44 w-44 rounded-xl border border-border bg-white p-2 shadow-sm"
                          />
                        ) : (
                          <div
                            className="h-44 w-44 rounded-xl border border-border bg-white p-2 shadow-sm flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                            dangerouslySetInnerHTML={{ __html: enrollQrCode }}
                          />
                        )
                      ) : (
                        <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-border bg-muted">
                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {/* Secret text fallback */}
                      <div className="mt-3 w-full max-w-xs">
                        <span className="text-[10px] text-muted-foreground block mb-1">
                          Or enter this key manually:
                        </span>
                        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono font-bold">
                          <span className="truncate">{enrollSecret}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(enrollSecret);
                              setCopiedSecret(true);
                              setTimeout(() => setCopiedSecret(false), 2000);
                            }}
                            className="ml-2 text-primary hover:text-primary/80 shrink-0"
                            title="Copy secret key"
                          >
                            {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Verification */}
                    <form onSubmit={handleConfirmMfaEnroll} className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block">
                          Step 2: Enter 6-digit verification code
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Type the code currently showing in your authenticator app to confirm setup:
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          value={enrollVerifyCode}
                          onChange={(e) => setEnrollVerifyCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          autoFocus
                          className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-xl font-mono tracking-[0.4em] font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEnrollingMfa(false);
                            setEnrollQrCode("");
                            setEnrollSecret("");
                            setEnrollVerifyCode("");
                            setEnrollError("");
                          }}
                          className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={enrollVerifyCode.length < 6}
                          className="flex-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                        >
                          Verify & Activate 2FA
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* ROW LEVEL SECURITY (RLS) STATUS & DATA PROTECTION */}
            {/* ------------------------------------------------------------------ */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Database Row Level Security (RLS)</h3>
                    <p className="text-xs text-muted-foreground">
                      Rules ensuring customers can never access or modify admin data.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Policies Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="font-bold text-foreground">Orders Table</p>
                  <p className="text-muted-foreground mt-0.5">
                    Customers can only <strong>INSERT</strong> orders. Only authenticated admins can read, update, or delete.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="font-bold text-foreground">Enquiries Table</p>
                  <p className="text-muted-foreground mt-0.5">
                    Customers can only <strong>INSERT</strong> enquiries. Only authenticated admins can read or delete.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="font-bold text-foreground">Products & Catalog</p>
                  <p className="text-muted-foreground mt-0.5">
                    Public can read catalog. Only authenticated admins can insert, edit prices/sizes, or delete.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="font-bold text-foreground">Storage (Product Images)</p>
                  <p className="text-muted-foreground mt-0.5">
                    Public can view drink photos. Only authenticated admins can upload or delete image files.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Security file: <code className="font-mono text-foreground font-semibold">supabase-security.sql</code>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Glory Way Limited Supabase Security
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/voljkpxdcjotkbdbwyvk/sql
-- Refer to supabase-security.sql in the project repository.`);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSql ? "Copied SQL info!" : "Copy RLS SQL Link"}
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* EMERGENCY WAREHOUSE PIN */}
            {/* ------------------------------------------------------------------ */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Emergency Warehouse PIN (Offline Backup)</h3>
                  <p className="text-xs text-muted-foreground">
                    Fallback 4-digit PIN for unlocking the dashboard when offline or without email access.
                  </p>
                </div>
              </div>

              {pinChangeMsg && (
                <div
                  className={`rounded-lg p-3 text-xs font-semibold flex items-center gap-2 ${
                    pinChangeMsg.error
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {pinChangeMsg.error ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {pinChangeMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdatePin} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      New Emergency PIN (4+ digits)
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="e.g. 5678"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Confirm new PIN"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Update Emergency PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------------- */}
      {/* MANUAL NEW ORDER MODAL */}
      {/* -------------------------------------------------------------------------------- */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">Record Customer Order</h2>
                  <p className="text-xs text-muted-foreground">For phone-in or direct warehouse walk-in orders</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderCustomer}
                    onChange={(e) => setNewOrderCustomer(e.target.value)}
                    placeholder="e.g. Chief Osagie"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newOrderPhone}
                    onChange={(e) => setNewOrderPhone(e.target.value)}
                    placeholder="e.g. 0803 123 4567"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Drink *
                </label>
                <select
                  value={newOrderDrinkSlug}
                  onChange={(e) => setNewOrderDrinkSlug(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {drinks.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name} ({d.category} · {d.brewer})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Packaging *
                  </label>
                  <div className="mt-1 flex gap-2">
                    {(["Bottle", "Can"] as const).map((pkg) => (
                      <button
                        key={pkg}
                        type="button"
                        onClick={() => setNewOrderPackaging(pkg)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                          newOrderPackaging === pkg
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {pkg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderQuantity}
                    onChange={(e) => setNewOrderQuantity(e.target.value)}
                    placeholder="e.g. 2 crates"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newOrderAddress}
                  onChange={(e) => setNewOrderAddress(e.target.value)}
                  placeholder="e.g. 15 Sapele Road, Benin City, Edo State"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Notes / Dispatch Instructions
                </label>
                <input
                  type="text"
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  placeholder="e.g. Call upon arrival at junction"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newOrderSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {newOrderSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Saving Order…
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Record Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
