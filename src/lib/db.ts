import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/** Create a SQLite adapter from DATABASE_URL. Shared by app and seed script. */
export function createAdapter() {
  return new PrismaBetterSqlite3({
    url: `${process.env.DATABASE_URL}`,
  });
}
