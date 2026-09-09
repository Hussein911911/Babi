/* ================= عميل الـ API =================
 * كل الاتصال بالخادم يمر من هنا: مصادقة بالرمز (Bearer)، ورسائل
 * خطأ عربية جاهزة للعرض. البيانات المشتركة بين كل الأجهزة تأتي
 * من قاعدة البيانات المركزية بدل التخزين المحلي.
 */
import type { Customer, Invoice, Medicine, Purchase, User } from "./types";

const TOKEN_KEY = "alfayd-token-v1";

export type Snapshot = {
  medicines: Medicine[];
  invoices: Invoice[];
  purchases: Purchase[];
  customers: Customer[];
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t: string) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* تجاهل */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* تجاهل */ }
  },
};

/* تنظيف مفاتيح التخزين المحلي القديمة (النسخة التي كانت تحفظ محلياً) */
export function purgeLegacyLocalData() {
  const legacy = [
    "alfayd-medicines-v4",
    "alfayd-invoices-v2",
    "alfayd-purchases-v2",
    "alfayd-customers-v1",
    "alfayd-session-v1",
  ];
  for (const k of legacy) {
    try { localStorage.removeItem(k); } catch { /* تجاهل */ }
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError("تعذّر الاتصال بالخادم — تحقق من الشبكة", 0);
  }

  let body: unknown = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `خطأ من الخادم (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return body as T;
}

/* ---------- المصادقة ---------- */
export const apiLogin = (username: string, password: string) =>
  request<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const apiMe = () => request<{ user: User }>("/api/auth/me");

export const apiLogout = () =>
  request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });

export const apiChangePassword = (current: string, next: string) =>
  request<{ ok: boolean }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current, next }),
  });

/* ---------- المستخدمون (مدير) ---------- */
export type UserRecord = { username: string; name: string; role: string; created_at: number };

export const apiListUsers = () => request<{ users: UserRecord[] }>("/api/users");

export const apiCreateUser = (payload: { username: string; password: string; name: string; role: string }) =>
  request<{ ok: boolean; users: UserRecord[] }>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiResetUserPassword = (username: string, password: string) =>
  request<{ ok: boolean }>(`/api/users/${encodeURIComponent(username)}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });

export const apiDeleteUser = (username: string) =>
  request<{ ok: boolean; users: UserRecord[] }>(`/api/users/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });

/* ---------- البيانات ---------- */
export const apiBootstrap = () => request<Snapshot>("/api/bootstrap");

/* الأصناف */
export const apiCreateMedicine = (med: Partial<Medicine>) =>
  request<Snapshot>("/api/medicines", { method: "POST", body: JSON.stringify(med) });

export const apiUpdateMedicine = (id: string, med: Partial<Medicine>) =>
  request<Snapshot>(`/api/medicines/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(med) });

export const apiDeleteMedicine = (id: string) =>
  request<Snapshot>(`/api/medicines/${encodeURIComponent(id)}`, { method: "DELETE" });

/* العملاء */
export const apiCreateCustomer = (payload: { name: string; kind: Customer["kind"]; phone: string; city: string }) =>
  request<Snapshot & { customer: Customer }>("/api/customers", { method: "POST", body: JSON.stringify(payload) });

export const apiDeleteCustomer = (id: string) =>
  request<Snapshot>(`/api/customers/${encodeURIComponent(id)}`, { method: "DELETE" });

/* الفواتير */
export const apiCreateInvoice = (payload: {
  customerId: string;
  payment: Invoice["payment"];
  approved: boolean;
  prepTime?: string;
  saleTime?: string;
  listDate?: string;
  preparedBy?: string;
  notes?: string;
  items: Invoice["items"];
}) => request<Snapshot & { invoice: Invoice }>("/api/invoices", { method: "POST", body: JSON.stringify(payload) });

export const apiApproveInvoice = (id: string) =>
  request<Snapshot>(`/api/invoices/${encodeURIComponent(id)}/approve`, { method: "POST" });

export const apiSettleInvoice = (id: string) =>
  request<Snapshot>(`/api/invoices/${encodeURIComponent(id)}/settle`, { method: "POST" });

/* المشتريات */
export const apiCreatePurchase = (payload: { company: string; items: Purchase["items"] }) =>
  request<Snapshot & { order: Purchase }>("/api/purchases", { method: "POST", body: JSON.stringify(payload) });

export const apiReceivePurchase = (id: string) =>
  request<Snapshot>(`/api/purchases/${encodeURIComponent(id)}/receive`, { method: "POST" });

/* النسخ الاحتياطي والبيانات */
export const apiRestoreSeed = () =>
  request<Snapshot>("/api/data/restore-seed", { method: "POST" });

export const apiClearAll = () =>
  request<Snapshot>("/api/data/clear-all", { method: "POST" });

export const apiImportBackup = (data: unknown) =>
  request<Snapshot>("/api/data/import", { method: "POST", body: JSON.stringify(data) });
