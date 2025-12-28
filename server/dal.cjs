const { db } = require("./db/index.cjs");
const {
  users,
  projects,
  messages,
  notifications,
  auditLogs,
  signupProgress,
  tickets,
  subscriptions,
  invoices,
  systemSettings,
} = require("./db/schema.cjs");
const { eq, desc, and, or, notInArray, sql } = require("drizzle-orm");

// Dashboard Stats
const getDashboardStats = async () => {
  if (!db) return null;
  console.log("Fetching dashboard stats...");
  try {
    // 1. Total Users
    const usersCount = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .then((res) => parseInt(res[0].count));
    console.log("Users count fetched:", usersCount);

    // 2. Active Projects (not completed or rejected)
    const activeProjectsCount = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(notInArray(projects.status, ["completed", "rejected"]))
      .then((res) => parseInt(res[0].count));
    console.log("Active projects fetched:", activeProjectsCount);

    // 3. Pending Tickets (not resolved or closed)
    const pendingTicketsCount = await db
      .select({ count: sql`count(*)` })
      .from(tickets)
      .where(notInArray(tickets.status, ["resolved", "closed"]))
      .then((res) => parseInt(res[0].count));
    console.log("Pending tickets fetched:", pendingTicketsCount);

    // 4. Total Revenue (Sum of paid invoices)
    const paidInvoices = await db
      .select()
      .from(invoices)
      .where(or(eq(invoices.status, "paid"), eq(invoices.status, "Paid")));

    const totalRevenue = paidInvoices.reduce((acc, inv) => {
      // Remove non-numeric chars except dot
      const cleanAmount = inv.amount ? inv.amount.replace(/[^0-9.]/g, "") : "0";
      return acc + (parseFloat(cleanAmount) || 0);
    }, 0);
    console.log("Total revenue calculated:", totalRevenue);

    // 5. Outstanding Revenue (Sum of invoices not paid/cancelled)
    const outstandingInvoices = await db
      .select()
      .from(invoices)
      .where(
        notInArray(invoices.status, ["paid", "Paid", "cancelled", "Cancelled"])
      );

    const outstandingRevenue = outstandingInvoices.reduce((acc, inv) => {
      const cleanAmount = inv.amount ? inv.amount.replace(/[^0-9.]/g, "") : "0";
      return acc + (parseFloat(cleanAmount) || 0);
    }, 0);
    console.log("Outstanding revenue calculated:", outstandingRevenue);

    return {
      totalUsers: usersCount,
      activeProjects: activeProjectsCount,
      pendingTickets: pendingTicketsCount,
      totalRevenue,
      outstandingRevenue,
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    throw error;
  }
};
const getUserByEmail = async (email) => {
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
};

const getUserById = async (id) => {
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
};

const createUser = async (userData) => {
  if (!db) return null;
  const result = await db.insert(users).values(userData).returning();
  return result[0];
};

const getAllUsers = async () => {
  if (!db) return [];
  return await db.select().from(users);
};

// Projects
const createProject = async (projectData) => {
  if (!db) return null;
  const result = await db.insert(projects).values(projectData).returning();
  return result[0];
};

const getAllProjects = async () => {
  if (!db) return [];
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
};

const getProjectsByEmail = async (email) => {
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.email, email));
};

// Messages
const createMessage = async (messageData) => {
  if (!db) return null;
  const result = await db.insert(messages).values(messageData).returning();
  return result[0];
};

const getAllMessages = async () => {
  if (!db) return [];
  return await db.select().from(messages).orderBy(desc(messages.createdAt));
};

const deleteMessage = async (id) => {
  if (!db) return;
  await db.delete(messages).where(eq(messages.id, id));
};

// Notifications
const createNotification = async (notifData) => {
  if (!db) return null;
  const result = await db.insert(notifications).values(notifData).returning();
  return result[0];
};

const getNotificationsByUserId = async (userId) => {
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(
      or(eq(notifications.userId, userId), eq(notifications.target, "all"))
    )
    .orderBy(desc(notifications.createdAt));
};

// Audit Logs
const createAuditLog = async (logData) => {
  if (!db) return null;
  await db.insert(auditLogs).values(logData);
};

const getAllAuditLogs = async () => {
  if (!db) return [];
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
};

// Signup Progress
const upsertSignupProgress = async (email, data, step) => {
  if (!db) return null;
  const existing = await db
    .select()
    .from(signupProgress)
    .where(eq(signupProgress.email, email));
  if (existing.length > 0) {
    const result = await db
      .update(signupProgress)
      .set({ data, step, updatedAt: new Date() })
      .where(eq(signupProgress.email, email))
      .returning();
    return result[0];
  } else {
    const result = await db
      .insert(signupProgress)
      .values({ email, data, step })
      .returning();
    return result[0];
  }
};

const getSignupProgress = async (email) => {
  if (!db) return null;
  const result = await db
    .select()
    .from(signupProgress)
    .where(eq(signupProgress.email, email));
  return result[0];
};

// System Settings
const getSystemSetting = async (key) => {
  if (!db) return null;
  const result = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key));
  return result[0];
};

const setSystemSetting = async (key, value) => {
  if (!db) return null;
  const existing = await getSystemSetting(key);
  if (existing) {
    const result = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return result[0];
  } else {
    const result = await db
      .insert(systemSettings)
      .values({ key, value })
      .returning();
    return result[0];
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },
  getAllUsers,
  createProject,
  getAllProjects,
  getProjectsByEmail,
  updateProject: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  },
  deleteProject: async (id) => {
    if (!db) return;
    await db.delete(projects).where(eq(projects.id, id));
  },

  // Messages
  createMessage,
  getAllMessages,
  deleteMessage,
  updateMessage: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(messages)
      .set({ ...data }) // messages doesn't have updatedAt
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  },

  // Notifications
  createNotification,
  getNotificationsByUserId,
  getAllNotifications: async () => {
    if (!db) return [];
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  },

  // Audit Logs
  createAuditLog,
  getAllAuditLogs,
  upsertSignupProgress,
  getSignupProgress,

  // Notifications (continued)
  markNotificationRead: async (id, userId) => {
    if (!db) return;
    const notif = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .then((res) => res[0]);
    if (!notif) return;

    if (notif.target === "all") {
      const readBy = notif.readBy || [];
      if (!readBy.includes(userId)) {
        await db
          .update(notifications)
          .set({ readBy: [...readBy, userId] })
          .where(eq(notifications.id, id));
      }
    } else {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id));
    }
  },

  markAllNotificationsRead: async (userId) => {
    if (!db) return;

    // 1. Mark user-specific notifications
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));

    // 2. Mark system-wide notifications
    const allNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.target, "all"));

    for (const notif of allNotifs) {
      const readBy = notif.readBy || [];
      if (!readBy.includes(userId)) {
        await db
          .update(notifications)
          .set({ readBy: [...readBy, userId] })
          .where(eq(notifications.id, notif.id));
      }
    }
  },

  // Tickets
  createTicket: async (ticketData) => {
    if (!db) return null;
    const result = await db.insert(tickets).values(ticketData).returning();
    return result[0];
  },

  getAllTickets: async () => {
    if (!db) return [];
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  },

  getTicketsByEmail: async (email) => {
    if (!db) return [];
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.userEmail, email))
      .orderBy(desc(tickets.createdAt));
  },

  getTicketById: async (id) => {
    if (!db) return null;
    const result = await db.select().from(tickets).where(eq(tickets.id, id));
    return result[0];
  },

  updateTicket: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return result[0];
  },

  deleteTicket: async (id) => {
    if (!db) return;
    await db.delete(tickets).where(eq(tickets.id, id));
  },

  // Subscriptions
  createSubscription: async (subData) => {
    if (!db) return null;
    const result = await db.insert(subscriptions).values(subData).returning();
    return result[0];
  },

  getAllSubscriptions: async () => {
    if (!db) return [];
    return await db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));
  },

  getSubscriptionById: async (id) => {
    if (!db) return null;
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return result[0];
  },

  updateSubscription: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  },

  deleteSubscription: async (id) => {
    if (!db) return;
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  },

  // Invoices
  createInvoice: async (invoiceData) => {
    if (!db) return null;
    const result = await db.insert(invoices).values(invoiceData).returning();
    return result[0];
  },

  getAllInvoices: async () => {
    if (!db) return [];
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  },

  getInvoicesByUserId: async (userId) => {
    if (!db) return [];
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  },

  getInvoiceById: async (id) => {
    if (!db) return null;
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  },

  updateInvoice: async (id, data) => {
    if (!db) return null;
    const result = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return result[0];
  },

  deleteInvoice: async (id) => {
    if (!db) return;
    await db.delete(invoices).where(eq(invoices.id, id));
  },

  // Email Verifications & Progress
  upsertSignupProgress,
  getSignupProgress,

  // Audit Logs
  createAuditLog,
  getAllAuditLogs,
  getSystemSetting,
  setSystemSetting,
  getDashboardStats,

  // System Health
  getSystemHealth: async () => {
    if (!db) return null;
    try {
      const start = Date.now();
      // Simple query to check DB connection and latency
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - start;

      // Get DB Size (Postgres specific)
      const sizeResult = await db.execute(
        sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size, pg_database_size(current_database()) as raw_size`
      );
      const dbSize = sizeResult[0]?.size || "Unknown";

      // Calculate a "usage percentage" based on a hypothetical limit (e.g., 500MB for free tier)
      // Neon free tier is usually 500MB.
      const rawSize = parseInt(sizeResult[0]?.raw_size || 0);
      const limit = 500 * 1024 * 1024; // 500MB
      const dbUsage = Math.min(Math.round((rawSize / limit) * 100), 100);

      return {
        status: "healthy",
        latency,
        dbSize,
        dbUsage,
      };
    } catch (error) {
      console.error("Health Check Error:", error);
      return {
        status: "unhealthy",
        error: error.message,
        dbUsage: 0,
      };
    }
  },
};
