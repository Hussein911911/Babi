/**
 * Applies prisma/migrations/*.sql directly through libsql.
 * Useful in sandboxes/CI where Prisma engine downloads are blocked.
 * In normal environments you can simply use `npx prisma db push`.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const root = path.join(__dirname, "..");
const dbPath = path.join(root, "prisma", "dev.db");
const migrationsDir = path.join(root, "prisma", "migrations");

async function main() {
  const client = createClient({ url: `file:${dbPath}` });
  const dirs = fs.readdirSync(migrationsDir).filter((d) =>
    fs.statSync(path.join(migrationsDir, d)).isDirectory()
  ).sort();

  for (const dir of dirs) {
    const file = path.join(migrationsDir, dir, "migration.sql");
    if (!fs.existsSync(file)) continue;
    const sql = fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    console.log(`✅ Applied migration: ${dir}`);
  }
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
