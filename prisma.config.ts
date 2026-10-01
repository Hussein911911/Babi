import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.join(__dirname, "prisma", "dev.db");

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: `file:${dbPath}`,
  },
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
