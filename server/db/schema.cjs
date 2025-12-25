const {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  role: text("role").default("client"),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id"),
  accountType: text("account_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name"), // Client/Project name
  email: text("email"), // Legacy or Contact Email
  company: text("company"),
  plan: text("plan"),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email"),
  subject: text("subject"),
  content: text("content"),
  status: text("status").default("unread"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id), // Nullable for system-wide
  title: text("title"),
  message: text("message"),
  read: boolean("read").default(false),
  readBy: jsonb("read_by"), // For system-wide notifications
  target: text("target").default("user"), // 'user' or 'all'
  createdAt: timestamp("created_at").defaultNow(),
});

const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: text("action"),
  performedBy: text("performed_by"), // Storing ID or Name as text for flexibility
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

const signupProgress = pgTable("signup_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  data: jsonb("data"),
  step: text("step"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  userEmail: text("user_email"),
  userName: text("user_name"),
  subject: text("subject"),
  message: text("message"), // Initial message content (encrypted)
  responses: jsonb("responses").default([]), // Array of response objects
  status: text("status").default("open"),
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  userName: text("user_name"),
  userEmail: text("user_email"),
  plan: text("plan"),
  status: text("status").default("pending"),
  startDate: timestamp("start_date"),
  details: text("details"), // Encrypted details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = {
  users,
  projects,
  messages,
  notifications,
  auditLogs,
  signupProgress,
  tickets,
  subscriptions,
};
