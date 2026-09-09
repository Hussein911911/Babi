/* ================= خادم نظام إدارة الأدوية =================
 * مكتب الفيض الدوائي العلمي — Express + SQLite
 * يقدّم واجهة النظام (ملفات البناء) و REST API في خدمة واحدة.
 */
import express from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  initDatabase, snapshot, verifyPassword,
  getUser, listUsers, createUser, deleteUser, updateUserPassword, updateUserProfile,
  issueToken, tokenUser, revokeToken,
  getAllPurchases,
  findMedicine, findInvoice, findPurchase, findCustomer,
  upsertMedicine, deleteMedicine,
  insertInvoice, updateInvoice, insertPurchase, updatePurchase,
  insertCustomer, deleteCustomer,
  nextInvoiceNumber, nextPurchaseNumber, deductStrips,
  restoreSeed, wipeData, tx,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);

initDatabase();

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "5mb" }));

/* ---------- أدوات مساعدة ---------- */
const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const fail = (res, status, message) => res.status(status).json({ error: message });

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = token ? tokenUser(token) : null;
  if (!user) return fail(res, 401, "جلسة الدخول غير صالحة — سجّل الدخول من جديد");
  req.user = user;
  req.token = token;
  next();
}

function adminOnly(req, res, next) {
  if (req.user.role !== "مدير النظام") return fail(res, 403, "هذه العملية متاحة لمدير النظام فقط");
  next();
}

/* ================= المصادقة ================= */
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res, 400, "أدخل اسم المستخدم وكلمة المرور");
  const u = getUser(String(username).trim().toLowerCase());
  if (!u || !verifyPassword(password, u.salt, u.pass_hash))
    return fail(res, 401, "اسم المستخدم أو كلمة المرور غير صحيحة");
  const token = issueToken(u.username);
  res.json({ token, user: { username: u.username, name: u.name, role: u.role } });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/logout", auth, (req, res) => {
  revokeToken(req.token);
  res.json({ ok: true });
});

app.post("/api/auth/change-password", auth, (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) return fail(res, 400, "أدخل كلمة المرور الحالية والجديدة");
  if (String(next).length < 4) return fail(res, 400, "كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل");
  const u = getUser(req.user.username);
  if (!verifyPassword(current, u.salt, u.pass_hash))
    return fail(res, 401, "كلمة المرور الحالية غير صحيحة");
  updateUserPassword(u.username, next);
  res.json({ ok: true });
});

/* ================= إدارة المستخدمين (للمدير فقط) ================= */
app.get("/api/users", auth, adminOnly, (req, res) => {
  res.json({ users: listUsers() });
});

app.post("/api/users", auth, adminOnly, (req, res) => {
  const { username, password, name, role } = req.body || {};
  const uname = String(username || "").trim().toLowerCase();
  if (!uname || !password || !name || !role)
    return fail(res, 400, "أكمل بيانات المستخدم: المعرّف، كلمة المرور، الاسم والوظيفة");
  if (!/^[a-z0-9_.-]{3,32}$/.test(uname))
    return fail(res, 400, "معرّف المستخدم: أحرف إنجليزية وأرقام فقط (3–32 خانة)");
  if (String(password).length < 4) return fail(res, 400, "كلمة المرور 4 خانات على الأقل");
  if (getUser(uname)) return fail(res, 400, "يوجد مستخدم بنفس المعرّف مسبقاً");
  createUser({ username: uname, password, name: String(name).trim(), role: String(role).trim() });
  res.json({ ok: true, users: listUsers() });
});

app.post("/api/users/:username/reset-password", auth, adminOnly, (req, res) => {
  const uname = req.params.username;
  const { password } = req.body || {};
  if (!getUser(uname)) return fail(res, 404, "المستخدم غير موجود");
  if (!password || String(password).length < 4) return fail(res, 400, "كلمة المرور 4 خانات على الأقل");
  updateUserPassword(uname, password);
  res.json({ ok: true });
});

app.put("/api/users/:username", auth, adminOnly, (req, res) => {
  const uname = req.params.username;
  const u = getUser(uname);
  if (!u) return fail(res, 404, "المستخدم غير موجود");
  const name = String(req.body?.name || u.name).trim();
  const role = String(req.body?.role || u.role).trim();
  if (!name || !role) return fail(res, 400, "الاسم والوظيفة مطلوبان");
  updateUserProfile(uname, { name, role });
  res.json({ ok: true, users: listUsers() });
});

app.delete("/api/users/:username", auth, adminOnly, (req, res) => {
  const uname = req.params.username;
  if (uname === req.user.username) return fail(res, 400, "لا يمكنك حذف حسابك الحالي");
  if (!getUser(uname)) return fail(res, 404, "المستخدم غير موجود");
  deleteUser(uname);
  res.json({ ok: true, users: listUsers() });
});

/* ================= البيانات الأساسية ================= */
app.get("/api/bootstrap", auth, (req, res) => {
  res.json(snapshot());
});

/* ================= الأصناف ================= */
app.post("/api/medicines", auth, (req, res) => {
  const m = req.body || {};
  if (!m.name) return fail(res, 400, "اسم المادة مطلوب");
  const med = { ...m, id: m.id || newId(), createdAt: m.createdAt || Date.now() };
  upsertMedicine(med);
  res.json(snapshot());
});

app.put("/api/medicines/:id", auth, (req, res) => {
  const existing = findMedicine(req.params.id);
  if (!existing) return fail(res, 404, "الصنف غير موجود");
  const updated = { ...existing, ...req.body, id: req.params.id };
  upsertMedicine(updated);
  res.json(snapshot());
});

app.delete("/api/medicines/:id", auth, (req, res) => {
  deleteMedicine(req.params.id);
  res.json(snapshot());
});

/* ================= العملاء ================= */
app.post("/api/customers", auth, (req, res) => {
  const { name, kind, phone, city } = req.body || {};
  if (!name) return fail(res, 400, "اسم الجهة مطلوب");
  if (kind !== "pharmacy" && kind !== "warehouse") return fail(res, 400, "نوع الجهة غير معروف");
  const c = {
    id: newId(),
    name: String(name).trim(),
    kind,
    phone: String(phone || "").trim(),
    city: String(city || "").trim() || "غير محددة",
    createdAt: Date.now(),
  };
  insertCustomer(c);
  res.json({ customer: c, ...snapshot() });
});

app.delete("/api/customers/:id", auth, (req, res) => {
  deleteCustomer(req.params.id);
  res.json(snapshot());
});

/* ================= الفواتير ================= */
function validateInvoiceBody(body) {
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items || items.length === 0) return "أضف مادة واحدة على الأقل للقائمة";
  if (!body.customerId) return "اختر الجهة المشترية";
  for (const it of items) {
    if (!it?.medicineId || !Number.isFinite(it.qty) || it.qty <= 0)
      return "بنود القائمة غير مكتملة";
  }
  return null;
}

app.post("/api/invoices", auth, (req, res) => {
  const body = req.body || {};
  const err = validateInvoiceBody(body);
  if (err) return fail(res, 400, err);
  const cust = findCustomer(body.customerId);
  if (!cust) return fail(res, 400, "الجهة المختارة غير موجودة — حدّث الصفحة وأعد المحاولة");

  const approve = body.approved !== false;
  const total = body.items.reduce((s, i) => s + (Number(i.total) || 0), 0);

  const invoice = tx(() => {
    const newInvoice = {
      id: newId(),
      number: nextInvoiceNumber(),
      date: new Date().toISOString(),
      customerId: cust.id,
      customer: cust.name,
      payment: body.payment === "آجل" ? "آجل" : "نقدي",
      approved: approve,
      prepTime: body.prepTime,
      saleTime: body.saleTime,
      listDate: body.listDate,
      preparedBy: body.preparedBy,
      notes: body.notes,
      items: body.items,
      total,
    };
    insertInvoice(newInvoice);
    if (approve) deductStrips(newInvoice.items);
    return newInvoice;
  });
  res.json({ invoice, ...snapshot() });
});

app.post("/api/invoices/:id/approve", auth, (req, res) => {
  const inv = findInvoice(req.params.id);
  if (!inv) return fail(res, 404, "الفاتورة غير موجودة");
  if (inv.approved !== false) return fail(res, 400, "الفاتورة معتمدة مسبقاً");
  tx(() => {
    inv.approved = true;
    updateInvoice(inv);
    deductStrips(inv.items);
  });
  res.json(snapshot());
});

app.post("/api/invoices/:id/settle", auth, (req, res) => {
  const inv = findInvoice(req.params.id);
  if (!inv) return fail(res, 404, "الفاتورة غير موجودة");
  if (inv.payment !== "آجل") return fail(res, 400, "الفاتورة ليست آجلة");
  inv.settled = true;
  updateInvoice(inv);
  res.json(snapshot());
});

/* ================= المشتريات ================= */
app.post("/api/purchases", auth, (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  if (!body.company) return fail(res, 400, "اختر الشركة المجهّزة");
  if (items.length === 0) return fail(res, 400, "أضف مادة واحدة على الأقل للطلبية");
  for (const it of items) {
    if (!it?.medicineId || !Number.isFinite(it.qty) || it.qty < 1)
      return fail(res, 400, "بنود الطلبية غير مكتملة");
  }
  const order = {
    id: newId(),
    number: nextPurchaseNumber(),
    date: new Date().toISOString(),
    company: String(body.company),
    items,
    total: items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.cost) || 0), 0),
    received: false,
  };
  insertPurchase(order);
  res.json({ order, ...snapshot() });
});

app.post("/api/purchases/:id/receive", auth, (req, res) => {
  const p = findPurchase(req.params.id);
  if (!p) return fail(res, 404, "الطلبية غير موجودة");
  if (p.received) return fail(res, 400, "الطلبية مستلمة مسبقاً");

  tx(() => {
    p.received = true;
    updatePurchase(p);
    for (const line of p.items) {
      const med = findMedicine(line.medicineId);
      if (!med) continue;
      med.qty = med.qty + (Number(line.qty) || 0);
      med.buyPrice = (Number(line.cost) || 0) * Math.max(1, med.stripsPerPiece);
      upsertMedicine(med);
    }
  });
  res.json(snapshot());
});

/* ================= النسخ الاحتياطي والبيانات ================= */
app.post("/api/data/restore-seed", auth, (req, res) => {
  restoreSeed();
  res.json(snapshot());
});

app.post("/api/data/clear-all", auth, (req, res) => {
  wipeData();
  res.json(snapshot());
});

app.post("/api/data/import", auth, (req, res) => {
  const data = req.body || {};
  if (!Array.isArray(data.medicines) || !Array.isArray(data.invoices))
    return fail(res, 400, "ملف غير صالح — تأكد أنه نسخة احتياطية من النظام");
  const purchases = Array.isArray(data.purchases) ? data.purchases : getAllPurchases();
  const customers = Array.isArray(data.customers) ? data.customers : snapshot().customers;

  tx(() => {
    wipeData();
    for (const m of data.medicines) if (m && m.id) upsertMedicine(m);
    for (const i of data.invoices) if (i && i.id) insertInvoice(i);
    for (const p of purchases) if (p && p.id) insertPurchase(p);
    for (const c of customers) if (c && c.id) insertCustomer(c);
  });
  res.json(snapshot());
});

/* ================= ملفات الواجهة ================= */
const distDir = path.join(__dirname, "..", "website-files", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  app.get("/", (req, res) =>
    res
      .type("text/plain; charset=utf-8")
      .send("واجهة النظام غير مبنية بعد — شغّل: npm run build")
  );
}

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

/* معالجة الأخطاء العامة */
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) fail(res, 500, "حدث خطأ غير متوقع في الخادم");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ نظام إدارة الأدوية يعمل على المنفذ ${PORT}`);
  console.log(`📦 قاعدة البيانات: ${process.env.DATA_DIR || path.join(__dirname, "data")}`);
});
