import { useCallback, useEffect, useState } from "react";
import type { Customer, Invoice, Medicine, Page, Purchase, Status, User } from "./types";
import { ADMIN_ROLE, fmtNum, getStatus, mergeIntoCart, type InvoiceItem } from "./types";
import {
  ApiError, apiApproveInvoice, apiBootstrap, apiChangePassword, apiClearAll,
  apiCreateCustomer, apiCreateInvoice, apiCreateMedicine, apiCreatePurchase,
  apiCreateUser, apiDeleteCustomer, apiDeleteMedicine, apiDeleteUser,
  apiImportBackup, apiListUsers, apiLogin, apiLogout, apiMe, apiReceivePurchase,
  apiResetUserPassword, apiRestoreSeed, apiSettleInvoice, apiUpdateMedicine,
  purgeLegacyLocalData, tokenStore, type Snapshot, type UserRecord,
} from "./api";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Sales } from "./components/Sales";
import { Purchases } from "./components/Purchases";
import { Reports } from "./components/Reports";
import { AlertsPage } from "./components/AlertsPage";
import { Settings } from "./components/Settings";
import { PrintReport } from "./components/PrintReport";
import { InvoicePrintModal } from "./components/InvoicePrintModal";
import { ToastStack, type Toast } from "./components/Overlays";
import {
  BellIcon,
  CartIcon,
  ChartIcon,
  DashboardIcon,
  GearIcon,
  LogoMark,
  LogoutIcon,
  PillIcon,
  RefreshIcon,
  TruckIcon,
} from "./icons";

type PrintDoc = { kind: "invoice"; invoice: Invoice } | null;

const NAV: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: <DashboardIcon /> },
  { key: "inventory", label: "المخزون", icon: <PillIcon /> },
  { key: "sales", label: "المبيعات", icon: <CartIcon /> },
  { key: "purchases", label: "المشتريات", icon: <TruckIcon /> },
  { key: "reports", label: "التقارير", icon: <ChartIcon /> },
  { key: "alerts", label: "التنبيهات", icon: <BellIcon /> },
  { key: "settings", label: "الإعدادات", icon: <GearIcon /> },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const [page, setPage] = useState<Page>("dashboard");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [printDoc, setPrintDoc] = useState<PrintDoc>(null);
  const [refreshing, setRefreshing] = useState(false);
  // سلة مبيعات مشتركة بين المخزون والمبيعات
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);

  const pushToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, type, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  /* ---------- استرجاع الجلسة وتحميل البيانات ---------- */
  const applySnapshot = (s: Snapshot) => {
    setMedicines(s.medicines);
    setInvoices(s.invoices);
    setPurchases(s.purchases);
    setCustomers(s.customers);
  };

  const forceLogout = useCallback((message: string) => {
    tokenStore.clear();
    setUser(null);
    setPage("dashboard");
    pushToast("error", message);
  }, [pushToast]);

  /* غلاف موحّد لنداءات الخادم: يعرض الخطأ وينهي الجلسة عند 401 */
  const guarded = useCallback(async <T,>(fn: () => Promise<T>, errorMessage?: string): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      const err = e as ApiError;
      if (err?.status === 401) {
        forceLogout("انتهت جلسة الدخول — سجّل الدخول من جديد");
        return null;
      }
      pushToast("error", err?.message || errorMessage || "حدث خطأ غير متوقع");
      return null;
    }
  }, [forceLogout, pushToast]);

  const bootstrap = useCallback(async (): Promise<boolean> => {
    const s = await guarded(apiBootstrap, "تعذّر تحميل البيانات من الخادم");
    if (!s) return false;
    applySnapshot(s);
    return true;
  }, [guarded]);

  useEffect(() => {
    purgeLegacyLocalData();
    (async () => {
      const token = tokenStore.get();
      if (!token) { setSessionChecked(true); return; }
      const me = await apiMe().catch(() => null);
      if (!me) {
        tokenStore.clear();
        setSessionChecked(true);
        return;
      }
      setUser(me.user);
      await bootstrap();
      setSessionChecked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* تحديث تلقائي خفيف عند العودة للنافذة (بيانات مشتركة بين الأجهزة) */
  useEffect(() => {
    if (!user) return;
    const onFocus = () => { void bootstrap(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, bootstrap]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    const ok = await bootstrap();
    setRefreshing(false);
    if (ok) pushToast("success", "تم تحديث البيانات من الخادم");
  }, [bootstrap, pushToast]);

  /* ---------- الدخول والخروج ---------- */
  const handleLogin = async (username: string, password: string): Promise<string | null> => {
    try {
      const r = await apiLogin(username, password);
      tokenStore.set(r.token);
      setUser(r.user);
      setBootstrapping(true);
      const ok = await bootstrap();
      setBootstrapping(false);
      if (!ok) { tokenStore.clear(); setUser(null); return "تعذّر تحميل البيانات من الخادم"; }
      pushToast("success", `مرحباً ${r.user.name} — تم تسجيل الدخول`);
      return null;
    } catch (e) {
      return (e as ApiError)?.message || "تعذّر الاتصال بالخادم";
    }
  };

  const handleLogout = async () => {
    await apiLogout().catch(() => { /* تجاهل */ });
    tokenStore.clear();
    setUser(null);
    setPage("dashboard");
  };

  /* ---------- عمليات الأصناف ---------- */
  const saveMedicine = async (data: Omit<Medicine, "id" | "createdAt">, id?: string): Promise<boolean> => {
    const s = id
      ? await guarded(() => apiUpdateMedicine(id, data), "تعذّر حفظ الصنف")
      : await guarded(() => apiCreateMedicine(data), "تعذّر إضافة الصنف");
    if (!s) return false;
    applySnapshot(s);
    return true;
  };

  const deleteMedicine = async (med: Medicine): Promise<boolean> => {
    const s = await guarded(() => apiDeleteMedicine(med.id), "تعذّر حذف الصنف");
    if (!s) return false;
    applySnapshot(s);
    pushToast("info", `تم حذف «${med.name}» من المخزون`);
    return true;
  };

  /* ---------- عمليات العملاء ---------- */
  const addCustomer = async (payload: { name: string; kind: Customer["kind"]; phone: string; city: string }): Promise<Customer | null> => {
    const r = await guarded(() => apiCreateCustomer(payload), "تعذّرت إضافة الجهة");
    if (!r) return null;
    applySnapshot(r);
    return r.customer;
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    const c = customers.find((x) => x.id === id);
    const s = await guarded(() => apiDeleteCustomer(id), "تعذّر حذف الجهة");
    if (!s) return;
    applySnapshot(s);
    if (c) pushToast("info", `تم حذف «${c.name}» من السجل`);
  };

  /* ---------- عمليات الفواتير ---------- */
  const createInvoice = async (
    payload: {
      customerId: string;
      payment: Invoice["payment"];
      prepTime?: string;
      saleTime?: string;
      listDate?: string;
      preparedBy?: string;
      notes?: string;
      items: Invoice["items"];
    },
    approve: boolean
  ): Promise<Invoice | null> => {
    const r = await guarded(() => apiCreateInvoice({ ...payload, approved: approve }), "تعذّر حفظ القائمة");
    if (!r) return null;
    applySnapshot(r);
    return r.invoice;
  };

  const approveInvoice = async (inv: Invoice): Promise<void> => {
    const s = await guarded(() => apiApproveInvoice(inv.id), "تعذّر اعتماد الفاتورة");
    if (!s) return;
    applySnapshot(s);
    pushToast("success", `تم اعتماد الفاتورة #${fmtNum(inv.number)} وخصم ${fmtNum(inv.items.reduce((x, i) => x + i.strips, 0))} شريط من المخزون`);
  };

  const settleInvoice = async (inv: Invoice): Promise<void> => {
    const s = await guarded(() => apiSettleInvoice(inv.id), "تعذّر تسجيل التحصيل");
    if (!s) return;
    applySnapshot(s);
    pushToast("success", `تم تسجيل تحصيل الفاتورة #${fmtNum(inv.number)} من ${inv.customer}`);
  };

  /* ---------- عمليات المشتريات ---------- */
  const createPurchase = async (company: string, items: Purchase["items"]): Promise<Purchase | null> => {
    const r = await guarded(() => apiCreatePurchase({ company, items }), "تعذّر حفظ الطلبية");
    if (!r) return null;
    applySnapshot(r);
    return r.order;
  };

  const receivePurchase = async (p: Purchase): Promise<void> => {
    const s = await guarded(() => apiReceivePurchase(p.id), "تعذّر استلام الطلبية");
    if (!s) return;
    applySnapshot(s);
    pushToast("success", `تم استلام الطلبية #${fmtNum(p.number)} وإضافة ${fmtNum(p.items.reduce((x, i) => x + i.qty, 0))} شريط للمخزون`);
  };

  /* ---------- البيانات والنسخ الاحتياطي ---------- */
  const restoreSeed = async (): Promise<void> => {
    const s = await guarded(apiRestoreSeed, "تعذّرت استعادة البيانات");
    if (!s) return;
    applySnapshot(s);
    pushToast("info", "تمت استعادة البيانات التجريبية كاملة");
  };

  const clearAll = async (): Promise<void> => {
    const s = await guarded(apiClearAll, "تعذّر مسح البيانات");
    if (!s) return;
    applySnapshot(s);
    pushToast("info", "تم مسح جميع البيانات من النظام — لكل المستخدمين");
  };

  const importBackup = async (data: unknown): Promise<boolean> => {
    const s = await guarded(() => apiImportBackup(data), "ملف غير صالح — تأكد أنه نسخة احتياطية من النظام");
    if (!s) return false;
    applySnapshot(s);
    pushToast("success", `تم استيراد النسخة الاحتياطية: ${fmtNum(s.medicines.length)} صنف و ${fmtNum(s.invoices.length)} فاتورة`);
    return true;
  };

  /* ---------- إدارة المستخدمين (مدير) ---------- */
  const loadUsers = async (): Promise<void> => {
    const r = await guarded(apiListUsers, "تعذّر جلب قائمة المستخدمين");
    if (r) setUsers(r.users);
  };

  const createUser = async (payload: { username: string; password: string; name: string; role: string }): Promise<boolean> => {
    const r = await guarded(() => apiCreateUser(payload), "تعذّرت إضافة المستخدم");
    if (!r) return false;
    setUsers(r.users);
    pushToast("success", `تمت إضافة المستخدم «${payload.name}»`);
    return true;
  };

  const resetUserPassword = async (username: string, password: string): Promise<boolean> => {
    const r = await guarded(() => apiResetUserPassword(username, password), "تعذّر تغيير كلمة المرور");
    if (!r) return false;
    pushToast("success", `تم تعيين كلمة مرور جديدة للمستخدم ${username}`);
    return true;
  };

  const deleteUser = async (username: string): Promise<boolean> => {
    const r = await guarded(() => apiDeleteUser(username), "تعذّر حذف المستخدم");
    if (!r) return false;
    setUsers(r.users);
    pushToast("info", `تم حذف المستخدم ${username}`);
    return true;
  };

  const changePassword = async (current: string, next: string): Promise<boolean> => {
    const r = await guarded(() => apiChangePassword(current, next), "تعذّر تغيير كلمة المرور");
    if (!r) return false;
    pushToast("success", "تم تغيير كلمة المرور بنجاح");
    return true;
  };

  const addToCart = (item: InvoiceItem): boolean => {
    const r = mergeIntoCart(cartItems, item);
    setCartItems(r.list);
    return r.merged;
  };

  /* فلاتر المخزون (مرفوعة هنا لربط التنبيهات واللوحة بصفحة المخزون) */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [invStatus, setInvStatus] = useState<Status | "all">("all");

  const goTo = (p: Page, status?: Status | "all") => {
    if (status !== undefined) {
      setInvStatus(status);
      setSearch("");
      setCategory("all");
    }
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const alertCount = medicines.filter((m) => getStatus(m) !== "ok").length;
  const isAdmin = user?.role === ADMIN_ROLE;

  /* ---------- شاشة تحميل الجلسة ---------- */
  if (!sessionChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-300">
        <div className="text-center">
          <span className="mx-auto grid size-14 animate-pulse place-items-center rounded-2xl bg-white/10 text-3xl">
            <LogoMark />
          </span>
          <p className="mt-4 font-display text-sm font-bold">جارٍ فتح النظام...</p>
        </div>
      </div>
    );
  }

  /* ---------- بوابة الدخول ---------- */
  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} bootstrapping={bootstrapping} />
        <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      </>
    );
  }

  /* ---------- هيكل النظام ---------- */
  return (
    <>
    <div className={`min-h-screen ${printDoc ? "hidden" : "print:hidden"}`}>
      {/* الشريط الجانبي (شاشات كبيرة) */}
      <aside className="no-print fixed inset-y-0 right-0 z-40 hidden w-64 flex-col border-l border-white/5 bg-slate-950 text-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-bl from-blue-900 to-cyan-700 text-[24px] text-cyan-200 shadow-lg shadow-cyan-950/50">
            <LogoMark />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-extrabold leading-tight">مكتب الفيض الدوائي</p>
            <p className="text-[10.5px] font-medium tracking-wide text-cyan-300/70">نظام إدارة الأدوية — إصدار الخادم</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => goTo(item.key)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  active ? "bg-white/8 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`absolute inset-y-2 right-0 w-1 rounded-full bg-cyan-400 transition-all duration-300 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`} />
                <span className={`text-lg transition-transform duration-200 ${active ? "text-cyan-300" : "group-hover:scale-110"}`}>{item.icon}</span>
                {item.label}
                {item.key === "alerts" && alertCount > 0 && (
                  <span className="ms-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-extrabold text-amber-300 ring-1 ring-amber-300/25 tabular-nums">
                    {fmtNum(alertCount)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-bl from-blue-900 to-cyan-700 font-display text-sm font-black text-cyan-200">
              {user.name.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold">{user.name}</p>
              <p className="truncate text-[11px] text-slate-400">{user.role}</p>
            </div>
            <button
              onClick={refreshData}
              title="تحديث البيانات من الخادم"
              className={`grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-all hover:bg-cyan-500/15 hover:text-cyan-300 ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshIcon className="text-base" />
            </button>
            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-all hover:bg-rose-500/15 hover:text-rose-400"
            >
              <LogoutIcon className="text-lg" />
            </button>
          </div>
        </div>
      </aside>

      {/* الشريط العلوي (جوال) */}
      <header className="no-print sticky top-0 z-40 border-b border-white/8 bg-slate-950/95 text-white backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-bl from-blue-900 to-cyan-700 text-xl text-cyan-200">
              <LogoMark />
            </span>
            <p className="font-display text-sm font-extrabold">مكتب الفيض الدوائي العلمي</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-slate-400 sm:block">{user.name}</span>
            <button
              onClick={refreshData}
              className={`grid size-9 place-items-center rounded-lg bg-white/8 text-slate-300 transition-colors hover:bg-cyan-500/20 hover:text-cyan-200 ${refreshing ? "animate-spin" : ""}`}
              title="تحديث البيانات من الخادم"
            >
              <RefreshIcon />
            </button>
            <button
              onClick={handleLogout}
              className="grid size-9 place-items-center rounded-lg bg-white/8 text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
              title="تسجيل الخروج"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
          {NAV.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => goTo(item.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-all ${
                  active ? "bg-cyan-600 text-white shadow-sm shadow-cyan-950/40" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {item.key === "alerts" && alertCount > 0 && (
                  <span className="rounded-full bg-amber-400/20 px-1.5 text-[10px] font-extrabold text-amber-300 tabular-nums">{fmtNum(alertCount)}</span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* المحتوى */}
      <div className="lg:pr-64">
        <main className="no-print mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {page === "dashboard" && <Dashboard user={user} medicines={medicines} invoices={invoices} goTo={goTo} />}
          {page === "inventory" && (
            <Inventory
              medicines={medicines}
              onSaveMedicine={saveMedicine}
              onDeleteMedicine={deleteMedicine}
              pushToast={pushToast}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              status={invStatus}
              setStatus={setInvStatus}
              cartItems={cartItems}
              onAddToCart={addToCart}
              goToSales={() => goTo("sales")}
            />
          )}
          {page === "sales" && (
            <Sales
              medicines={medicines}
              invoices={invoices}
              items={cartItems}
              setItems={setCartItems}
              customers={customers}
              onAddCustomer={addCustomer}
              onDeleteCustomer={deleteCustomer}
              pushToast={pushToast}
              onPrintInvoice={(inv) => setPrintDoc({ kind: "invoice", invoice: inv })}
              userName={user.name}
              onCreateInvoice={createInvoice}
              onApproveInvoice={approveInvoice}
              onSettleInvoice={settleInvoice}
            />
          )}
          {page === "purchases" && (
            <Purchases
              medicines={medicines}
              purchases={purchases}
              pushToast={pushToast}
              onCreatePurchase={createPurchase}
              onReceivePurchase={receivePurchase}
            />
          )}
          {page === "reports" && (
            <Reports
              medicines={medicines}
              invoices={invoices}
              purchases={purchases}
              customers={customers}
              restoreSeed={restoreSeed}
              onImportBackup={importBackup}
              pushToast={pushToast}
            />
          )}
          {page === "alerts" && <AlertsPage medicines={medicines} goTo={goTo} />}
          {page === "settings" && (
            <Settings
              user={user}
              isAdmin={isAdmin}
              users={users}
              onLoadUsers={loadUsers}
              onCreateUser={createUser}
              onResetUserPassword={resetUserPassword}
              onDeleteUser={deleteUser}
              onChangePassword={changePassword}
              onLogout={handleLogout}
              restoreSeed={restoreSeed}
              clearAll={clearAll}
              medicineCount={medicines.length}
              invoiceCount={invoices.length}
            />
          )}
        </main>

        <footer className="no-print border-t border-slate-200/70 py-4 text-center text-[11px] text-slate-400">
          مكتب الفيض الدوائي العلمي — نظام إدارة الأدوية · البيانات محفوظة على خادم النظام ومشتركة بين جميع الأجهزة
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>

    {/* طبقة الطباعة: فاتورة فردية أو تقرير المخزون */}
    {printDoc ? (
      <InvoicePrintModal invoice={printDoc.invoice} medicines={medicines} onClose={() => setPrintDoc(null)} />
    ) : (
      <PrintReport medicines={medicines} title="المخزون الكامل" />
    )}
    </>
  );
}
