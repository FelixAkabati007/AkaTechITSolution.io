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
} = require("./db/schema.cjs");
const { eq, desc, and, or } = require("drizzle-orm");

// Users
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

  // Email Verifications & Progress
  upsertSignupProgress,
  getSignupProgress,

  // Audit Logs
  createAuditLog,
  getAllAuditLogs,
};
