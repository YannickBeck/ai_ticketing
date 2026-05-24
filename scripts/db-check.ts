import { prisma } from "../src/server/db/prisma";

function describeDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/spargelstand_app?schema=public";

  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.replace("/", ""),
      schema: url.searchParams.get("schema") ?? "public",
    };
  } catch {
    return {
      host: "unknown",
      port: "unknown",
      database: "unknown",
      schema: "unknown",
    };
  }
}

async function main() {
  const target = describeDatabaseUrl();

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(
      JSON.stringify(
        {
          status: "ok",
          database: target,
        },
        null,
        2,
      ),
    );
  } catch {
    console.error(
      `db:check failed: PostgreSQL ist unter ${target.host}:${target.port}/${target.database} nicht erreichbar. Starte einen lokalen PostgreSQL-Dienst passend zur DATABASE_URL und fuehre danach npm run prisma:migrate aus.`,
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
