import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// In Next.js, env files are loaded automatically. For scripts/tests running
// via tsx directly, we need to load them manually using Node 20.12+ API.
if (typeof (process as NodeJS.Process & { loadEnvFile?: (p?: string) => void }).loadEnvFile === "function") {
  const load = (process as NodeJS.Process & { loadEnvFile: (p?: string) => void }).loadEnvFile;
  try { load(); } catch { /* .env not present */ }
  try { load(".env.local"); } catch { /* .env.local not present */ }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/spargelstand_app?schema=public";

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
