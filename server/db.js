import pg from "pg";
import { Database as SqliteDatabase } from "bun:sqlite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { sql } from "drizzle-orm";
import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const sessionTable = pgTable("session", {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => userTable.id),
    token: varchar("token", { length: 512 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    ipAddress: varchar("ipAddress", { length: 128 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const accountTable = pgTable("account", {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => userTable.id),
    accountId: varchar("accountId", { length: 512 }).notNull(),
    providerId: varchar("providerId", { length: 128 }).notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verificationTable = pgTable("verification", {
    id: serial("id").primaryKey(),
    identifier: varchar("identifier", { length: 320 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const authSchema = {
    user: userTable,
    session: sessionTable,
    account: accountTable,
    verification: verificationTable,
};

const useSqlite = !process.env.DATABASE_URL;
const authProvider = useSqlite ? "sqlite" : "pg";
const sqlitePath = new URL("./auth.db", import.meta.url).pathname;

const db = useSqlite
    ? drizzleSqlite(new SqliteDatabase(sqlitePath), { schema: authSchema })
    : drizzlePg(new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 }), { schema: authSchema });

export const database = db;
export const provider = authProvider;

const executeSql = async (query) => {
    const rawQuery = query && typeof query.toQuery === "function" ? query.toQuery({}) : query;
    if (typeof db.session.execute === "function") {
        return db.session.execute(rawQuery);
    }
    if (typeof db.session.exec === "function") {
        return db.session.exec(rawQuery?.sql || rawQuery);
    }
    if (typeof db.session.run === "function") {
        return db.session.run(rawQuery?.sql || rawQuery);
    }
    throw new Error("Unsupported database session executor");
};

export async function ensureAuthSchema() {
    if (useSqlite) {
        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255),
        email VARCHAR(320) NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" VARCHAR(128),
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS account (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accountId" VARCHAR(512) NOT NULL,
        "providerId" VARCHAR(128) NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS verification (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier VARCHAR(320) NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    } else {
        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(320) NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS session (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" VARCHAR(128),
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS account (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accountId" VARCHAR(512) NOT NULL,
        "providerId" VARCHAR(128) NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

        await executeSql(sql`
      CREATE TABLE IF NOT EXISTS verification (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(320) NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    }
}
