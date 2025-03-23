import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  uuid,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `copypanda_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const articleStatus = pgEnum("article_status", [
  "running",
  "completed",
  "failed",
]);

export const articles = createTable("article", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title")
    .notNull()
    .$defaultFn(() => "Draft"),
  content: text("content"),
  status: articleStatus("status")
    .notNull()
    .$defaultFn(() => "running"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const articlesRelations = relations(articles, ({ one, many }) => ({
  user: one(users, { fields: [articles.userId], references: [users.id] }),
  tasks: one(tasks, {
    fields: [articles.id],
    references: [tasks.articleId],
  }),
}));

export const tasks = createTable("task", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id),
  runId: text("run_id").notNull(),
  publicToken: text("public_token").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  article: one(articles, {
    fields: [tasks.articleId],
    references: [articles.id],
  }),
}));

export const presets = createTable("preset", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const presetsRelations = relations(presets, ({ one }) => ({
  user: one(users, { fields: [presets.userId], references: [users.id] }),
  format: one(presetFormat, {
    fields: [presets.id],
    references: [presetFormat.presetId],
  }),
  length: one(presetLength, {
    fields: [presets.id],
    references: [presetLength.presetId],
  }),
  options: one(presetOptions, {
    fields: [presets.id],
    references: [presetOptions.presetId],
  }),
  style: one(presetStyle, {
    fields: [presets.id],
    references: [presetStyle.presetId],
  }),
}));

export const presetFormat = createTable("preset_format", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  presetId: uuid("preset_id")
    .notNull()
    .references(() => presets.id),
  subheadings: boolean("subheadings").notNull().default(false),
  bulletPoints: boolean("bullet_points").notNull().default(false),
  numberedList: boolean("numbered_list").notNull().default(false),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const presetLength = createTable("preset_length", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  presetId: uuid("preset_id")
    .notNull()
    .references(() => presets.id),
  short: boolean("short").notNull().default(false),
  medium: boolean("medium").notNull().default(true),
  long: boolean("long").notNull().default(false),
  superLong: boolean("super_long").notNull().default(false),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export const presetOptions = createTable("preset_options", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  presetId: uuid("preset_id")
    .notNull()
    .references(() => presets.id),
  faqSections: boolean("faq_sections").notNull().default(false),
  summary: boolean("summary").notNull().default(false),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export const presetStyleContentTone = pgEnum("preset_style_content_tone", [
  "casual",
  "formal",
  "technical",
  "creative",
  "educational",
  "journalistic",
]);

export const presetStyleWritingStyle = pgEnum("preset_style_writing_style", [
  "narrative",
  "descriptive",
  "expository",
  "persuasive",
  "conversational",
  "analytical",
]);

export const presetStyle = createTable("preset_style", {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  presetId: uuid("preset_id")
    .notNull()
    .references(() => presets.id),
  contentTone: presetStyleContentTone("content_tone")
    .notNull()
    .$defaultFn(() => "casual"),
  writingStyle: presetStyleWritingStyle("writing_style")
    .notNull()
    .$defaultFn(() => "narrative"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export const presetFormatRelations = relations(presetFormat, ({ one }) => ({
  preset: one(presets, {
    fields: [presetFormat.presetId],
    references: [presets.id],
  }),
}));

export const presetLengthRelations = relations(presetLength, ({ one }) => ({
  preset: one(presets, {
    fields: [presetLength.presetId],
    references: [presets.id],
  }),
}));

export const presetOptionsRelations = relations(presetOptions, ({ one }) => ({
  preset: one(presets, {
    fields: [presetOptions.presetId],
    references: [presets.id],
  }),
}));

export const presetStyleRelations = relations(presetStyle, ({ one }) => ({
  preset: one(presets, {
    fields: [presetStyle.presetId],
    references: [presets.id],
  }),
}));
