/* ================= طبقة قاعدة البيانات =================
 * SQLite المدمجة في Node (node:sqlite) — بدون أي اعتماديات خارجية.
 * ملف قاعدة بيانات واحد، نسخ احتياطي سهل، وأداء ممتاز لحجم عمل
 * مكتب دوائي. مسار البيانات قابل للتبديل عبر متغير البيئة DATA_DIR.
 * يتطلب Node 22 أو أحدث.
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  SEED_USERS,
  SEED_MEDICINES,
  SEED_INVOICES,
  SEED_PURCHASES,
  SEED_CUSTOMERS,
} from "./seed-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, "alfayd.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username    TEXT PRIMARY KEY,
    pass_hash   TEXT NOT NULL,
    salt        TEXT NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tokens (
    token       TEXT PRIMARY KEY,
    username    TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    created_at  INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS medicines (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS invoices (
    id     TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    date   TEXT NOT NULL,
    data   TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS purchases (
    id     TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    date   TEXT NOT NULL,
    data   TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customers (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
`);

/* معاملة يدوية (لا تتوفر دالة مساعدة في node:sqlite) */
export function tx(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* تجاهل */ }
    throw e;
  }
}

/* ---------- كلمات المرور (scrypt) ---------- */
export function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), s, 64).toString("hex");
  return { salt: s, hash };
}

export function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- استعلامات عامة ---------- */
const listJSON = (table) =>
  db.prepare(`SELECT data FROM ${table}`).all().map((r) => JSON.parse(r.data));

export const getAllMedicines = () => listJSON("medicines");
export const getAllCustomers = () => listJSON("customers");

export const getAllInvoices = () =>
  db
    .prepare(`SELECT data FROM invoices ORDER BY number DESC`)
    .all()
    .map((r) => JSON.parse(r.data));

export const getAllPurchases = () =>
  db
    .prepare(`SELECT data FROM purchases ORDER BY number DESC`)
    .all()
    .map((r) => JSON.parse(r.data));

export function snapshot() {
  return {
    medicines: getAllMedicines(),
    invoices: getAllInvoices(),
    purchases: getAllPurchases(),
    customers: getAllCustomers(),
  };
}

const getJSON = (table, id) => {
  const r = db.prepare(`SELECT data FROM ${table} WHERE id = ?`).get(id);
  return r ? JSON.parse(r.data) : null;
};

export const findMedicine = (id) => getJSON("medicines", id);
export const findInvoice = (id) => getJSON("invoices", id);
export const findPurchase = (id) => getJSON("purchases", id);
export const findCustomer = (id) => getJSON("customers", id);

/* ---------- كتابات أساسية ---------- */
export const upsertMedicine = (med) =>
  db.prepare(`INSERT OR REPLACE INTO medicines (id, data) VALUES (?, ?)`).run(med.id, JSON.stringify(med));

export const deleteMedicine = (id) =>
  db.prepare(`DELETE FROM medicines WHERE id = ?`).run(id);

export const insertInvoice = (inv) =>
  db.prepare(`INSERT INTO invoices (id, number, date, data) VALUES (?, ?, ?, ?)`).run(inv.id, inv.number, inv.date, JSON.stringify(inv));

export const updateInvoice = (inv) =>
  db.prepare(`UPDATE invoices SET data = ?, number = ?, date = ? WHERE id = ?`).run(JSON.stringify(inv), inv.number, inv.date, inv.id);

export const insertPurchase = (p) =>
  db.prepare(`INSERT INTO purchases (id, number, date, data) VALUES (?, ?, ?, ?)`).run(p.id, p.number, p.date, JSON.stringify(p));

export const updatePurchase = (p) =>
  db.prepare(`UPDATE purchases SET data = ?, number = ?, date = ? WHERE id = ?`).run(JSON.stringify(p), p.number, p.date, p.id);

export const insertCustomer = (c) =>
  db.prepare(`INSERT INTO customers (id, data) VALUES (?, ?)`).run(c.id, JSON.stringify(c));

export const deleteCustomer = (id) =>
  db.prepare(`DELETE FROM customers WHERE id = ?`).run(id);

export const nextInvoiceNumber = () =>
  db.prepare(`SELECT COALESCE(MAX(number), 1000) + 1 AS n FROM invoices`).get().n;

export const nextPurchaseNumber = () =>
  db.prepare(`SELECT COALESCE(MAX(number), 500) + 1 AS n FROM purchases`).get().n;

/* خصم أشرطة من المخزون داخل معاملة */
export function deductStrips(items) {
  const upd = db.prepare(`UPDATE medicines SET data = ? WHERE id = ?`);
  for (const it of items) {
    if (!it?.medicineId || !Number.isFinite(it.strips) || it.strips <= 0) continue;
    const med = findMedicine(it.medicineId);
    if (!med) continue;
    med.qty = Math.max(0, med.qty - it.strips);
    upd.run(JSON.stringify(med), med.id);
  }
}

/* ---------- المستخدمون والجلسات ---------- */
export const getUser = (username) =>
  db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

export const listUsers = () =>
  db.prepare(`SELECT username, name, role, created_at FROM users ORDER BY created_at`).all();

export function createUser({ username, password, name, role }) {
  const { salt, hash } = hashPassword(password);
  db.prepare(`INSERT INTO users (username, pass_hash, salt, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(username, hash, salt, name, role, Date.now());
}

export const deleteUser = (username) =>
  db.prepare(`DELETE FROM users WHERE username = ?`).run(username);

export function updateUserPassword(username, password) {
  const { salt, hash } = hashPassword(password);
  db.prepare(`UPDATE users SET pass_hash = ?, salt = ? WHERE username = ?`).run(hash, salt, username);
}

export const updateUserProfile = (username, { name, role }) =>
  db.prepare(`UPDATE users SET name = ?, role = ? WHERE username = ?`).run(name, role, username);

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 يوماً

export function issueToken(username) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare(`INSERT INTO tokens (token, username, created_at) VALUES (?, ?, ?)`)
    .run(token, username, Date.now());
  return token;
}

export function tokenUser(token) {
  const row = db.prepare(`SELECT username, created_at FROM tokens WHERE token = ?`).get(token);
  if (!row) return null;
  if (Date.now() - row.created_at > TOKEN_TTL_MS) {
    db.prepare(`DELETE FROM tokens WHERE token = ?`).run(token);
    return null;
  }
  const u = getUser(row.username);
  if (!u) return null;
  return { username: u.username, name: u.name, role: u.role };
}

export const revokeToken = (token) =>
  db.prepare(`DELETE FROM tokens WHERE token = ?`).run(token);

/* ---------- البذرة ---------- */
function insertSeedData() {
  for (const m of SEED_MEDICINES) upsertMedicine(m);
  for (const i of SEED_INVOICES) insertInvoice(i);
  for (const p of SEED_PURCHASES) insertPurchase(p);
  for (const c of SEED_CUSTOMERS) insertCustomer(c);
}

export function wipeData() {
  db.exec(`DELETE FROM medicines; DELETE FROM invoices; DELETE FROM purchases; DELETE FROM customers;`);
}

export const restoreSeed = () =>
  tx(() => {
    wipeData();
    insertSeedData();
  });

export function initDatabase() {
  /* المستخدمون الافتراضيون */
  for (const u of SEED_USERS) {
    if (!getUser(u.username)) createUser(u);
  }
  /* بيانات تجريبية عند أول تشغيل فقط */
  const count = db.prepare(`SELECT COUNT(*) AS n FROM medicines`).get().n;
  const invCount = db.prepare(`SELECT COUNT(*) AS n FROM invoices`).get().n;
  if (count === 0 && invCount === 0) insertSeedData();
}
