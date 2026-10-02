// dripkits schema. Rule from the plan: if he might ever change it, it is a row, not a constant.
// Categories, kit types, seasons, clubs, players, sizes are all tables. Nothing here is an enum
// except states that the code itself branches on.

import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- enums the code branches on ----------

/** The four states of the PDP buy box. Per size, never per product. */
export const variantStatus = pgEnum("variant_status", [
  "in_stock",
  "interested",
  "upcoming",
  "out_of_stock",
]);

export const clubKind = pgEnum("club_kind", ["club", "national"]);
export const mediaKind = pgEnum("media_kind", ["front", "back", "detail", "lifestyle"]);
export const userRole = pgEnum("user_role", ["customer", "admin"]);
export const notifyKind = pgEnum("notify_kind", ["upcoming", "restock"]);

// ---------- reference data (he edits these in admin) ----------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kitTypes = pgTable("kit_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sort: integer("sort").notNull().default(0),
});

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // "26-27"
  label: text("label").notNull(), // "26/27"
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(), // "RMA", used by the dummy crest
  kind: clubKind("kind").notNull().default("club"),
  country: text("country"),
  primaryColor: text("primary_color").notNull(), // hex, drives the PDP tint
  secondaryColor: text("secondary_color"),
  crestUrl: text("crest_url"), // null until he supplies real crests
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  clubId: uuid("club_id").references(() => clubs.id, { onDelete: "set null" }),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const sizes = pgTable("sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // "M"
  label: text("label").notNull(), // "Medium"
  sort: integer("sort").notNull().default(0),
});

// ---------- catalogue ----------

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "restrict" }),
    seasonId: uuid("season_id").references(() => seasons.id, { onDelete: "set null" }),
    kitTypeId: uuid("kit_type_id").references(() => kitTypes.id, { onDelete: "set null" }),
    /** INR minor unit. 149900 = Rs 1,499. Never a float. */
    pricePaise: integer("price_paise").notNull(),
    compareAtPaise: integer("compare_at_paise"),
    description: text("description"),
    fabric: text("fabric"),
    fitNotes: text("fit_notes"),
    care: text("care"),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_club_idx").on(t.clubId),
    index("products_active_idx").on(t.active),
  ],
);

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    kind: mediaKind("kind").notNull().default("front"),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("product_media_product_idx").on(t.productId)],
);

export const productPlayers = pgTable(
  "product_players",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.playerId] })],
);

/** One row per product per size. This is where the four-state machine lives. */
export const variants = pgTable(
  "variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sizeId: uuid("size_id")
      .notNull()
      .references(() => sizes.id, { onDelete: "restrict" }),
    status: variantStatus("status").notNull().default("interested"),
    stockQty: integer("stock_qty").notNull().default(0),
    /** Denormalised count of interest_requests, kept in step by the insert transaction. */
    interestCount: integer("interest_count").notNull().default(0),
    expectedDate: date("expected_date"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("variants_product_size_uq").on(t.productId, t.sizeId),
    index("variants_status_idx").on(t.status),
  ],
);

// ---------- people ----------

/** id mirrors the Supabase auth user id once auth exists. */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
  phone: text("phone"),
  name: text("name"),
  role: userRole("role").notNull().default("customer"),
  fitProfile: jsonb("fit_profile").$type<{
    heightCm?: number;
    weightKg?: number;
    fitPref?: "slim" | "regular" | "loose";
    brandSize?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- demand ----------

export const interestRequests = pgTable(
  "interest_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    /** Email or phone, whichever they gave. Guests have no user_id. */
    contact: text("contact").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
  },
  (t) => [
    index("interest_requests_variant_idx").on(t.variantId),
    uniqueIndex("interest_requests_variant_contact_uq").on(t.variantId, t.contact),
  ],
);

export const notifyRequests = pgTable(
  "notify_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    kind: notifyKind("kind").notNull(),
    contact: text("contact").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("notify_requests_variant_contact_kind_uq").on(t.variantId, t.contact, t.kind)],
);

export const wishlists = pgTable(
  "wishlists",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

// ---------- relations (for db.query.*) ----------

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  products: many(products),
  players: many(players),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  club: one(clubs, { fields: [players.clubId], references: [clubs.id] }),
  productPlayers: many(productPlayers),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  club: one(clubs, { fields: [products.clubId], references: [clubs.id] }),
  season: one(seasons, { fields: [products.seasonId], references: [seasons.id] }),
  kitType: one(kitTypes, { fields: [products.kitTypeId], references: [kitTypes.id] }),
  media: many(productMedia),
  variants: many(variants),
  productPlayers: many(productPlayers),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, { fields: [productMedia.productId], references: [products.id] }),
}));

export const productPlayersRelations = relations(productPlayers, ({ one }) => ({
  product: one(products, { fields: [productPlayers.productId], references: [products.id] }),
  player: one(players, { fields: [productPlayers.playerId], references: [players.id] }),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
  size: one(sizes, { fields: [variants.sizeId], references: [sizes.id] }),
  interestRequests: many(interestRequests),
}));

export const interestRequestsRelations = relations(interestRequests, ({ one }) => ({
  variant: one(variants, { fields: [interestRequests.variantId], references: [variants.id] }),
  user: one(profiles, { fields: [interestRequests.userId], references: [profiles.id] }),
}));

// ---------- types ----------

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type VariantStatus = (typeof variantStatus.enumValues)[number];
export type Club = typeof clubs.$inferSelect;
export type Category = typeof categories.$inferSelect;
