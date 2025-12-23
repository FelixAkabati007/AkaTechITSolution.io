import { format } from "date-fns";

// Initial Mock Data
export const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "client@gmail.com",
    role: "Client",
    status: "Active",
    avatar: "JD",
    avatarUrl: null,
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@akatech.com",
    role: "Super Admin",
    status: "Active",
    avatar: "AD",
    avatarUrl: null,
  },
];

export const initialProjects = [
  {
    id: 1,
    clientId: 1,
    title: "E-Commerce Website Redesign",
    description:
      "Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance.",
    status: "In Progress",
    currentPhase: "Design",
    phases: [
      { name: "Initiation", status: "Completed", date: "2023-10-12" },
      { name: "Design", status: "In Progress", date: "2023-11-01" },
      { name: "Development", status: "Pending", date: "2023-12-15" },
      { name: "Deployment", status: "Pending", date: "2024-01-20" },
    ],
    files: [
      { name: "Wireframes_v1.pdf", date: "2023-10-25", size: "2.4 MB" },
      { name: "Project_Scope.docx", date: "2023-10-15", size: "1.1 MB" },
    ],
  },
  {
    id: 2,
    clientId: 1,
    title: "Mobile App Development",
    description:
      "Native iOS and Android application for customer loyalty program.",
    status: "Pending",
    currentPhase: "Initiation",
    phases: [
      { name: "Initiation", status: "In Progress", date: "2023-12-01" },
      { name: "Design", status: "Pending", date: "TBD" },
      { name: "Development", status: "Pending", date: "TBD" },
    ],
    files: [],
  },
  {
    id: 3,
    clientId: 1,
    title: "Inventory Management System",
    description:
      "Automated inventory tracking with barcode scanning and real-time stock alerts.",
    status: "Pending",
    currentPhase: "Initiation",
    phases: [
      { name: "Initiation", status: "Pending", date: "TBD" },
      { name: "Design", status: "Pending", date: "TBD" },
      { name: "Development", status: "Pending", date: "TBD" },
    ],
    files: [],
  },
  {
    id: 4,
    clientId: 1,
    title: "HR & Payroll System",
    description:
      "Comprehensive employee management and automated payroll processing system.",
    status: "Pending",
    currentPhase: "Initiation",
    phases: [
      { name: "Initiation", status: "Pending", date: "TBD" },
      { name: "Design", status: "Pending", date: "TBD" },
      { name: "Development", status: "Pending", date: "TBD" },
    ],
    files: [],
  },
  {
    id: 5,
    clientId: 1,
    title: "CRM Integration",
    description:
      "Custom CRM solution integrated with existing sales and support workflows.",
    status: "Pending",
    currentPhase: "Initiation",
    phases: [
      { name: "Initiation", status: "Pending", date: "TBD" },
      { name: "Design", status: "Pending", date: "TBD" },
      { name: "Development", status: "Pending", date: "TBD" },
    ],
    files: [],
  },
];

export const initialInvoices = [
  {
    id: "INV-2023-001",
    clientId: 1,
    projectId: 1,
    amount: 5000.0,
    date: "2023-10-15",
    dueDate: "2023-10-30",
    status: "Paid",
    items: [{ description: "Initial Deposit (50%)", qty: 1, rate: 5000.0 }],
  },
  {
    id: "INV-2023-002",
    clientId: 1,
    projectId: 1,
    amount: 2500.0,
    date: "2023-11-15",
    dueDate: "2023-11-30",
    status: "Unpaid",
    items: [{ description: "Design Phase Milestone", qty: 1, rate: 2500.0 }],
  },
];

export const initialTickets = [
  {
    id: "TKT-1001",
    clientId: 1,
    subject: "Login issues on staging server",
    status: "Open",
    priority: "High",
    lastUpdate: "2 hours ago",
    messages: [
      {
        sender: "Client",
        text: "I cannot log in to the staging environment. Getting 500 error.",
        time: "2023-12-18 09:00",
      },
      {
        sender: "Support",
        text: "We are looking into it. Please hold on.",
        time: "2023-12-18 09:15",
      },
    ],
  },
  {
    id: "TKT-1002",
    clientId: 1,
    subject: "Question about invoice INV-2023-002",
    status: "Resolved",
    priority: "Medium",
    lastUpdate: "1 day ago",
    messages: [
      {
        sender: "Client",
        text: "Does this include the logo design?",
        time: "2023-11-16 10:00",
      },
      {
        sender: "Support",
        text: "Yes, it covers all design assets.",
        time: "2023-11-16 11:30",
      },
    ],
  },
];

export const initialActivities = [
  {
    id: 1,
    user: "System",
    action: "Project Created",
    details: "E-Commerce Website Redesign",
    time: "Oct 12, 2023",
  },
  {
    id: 2,
    user: "John Doe",
    action: "Invoice Paid",
    details: "INV-2023-001",
    time: "Oct 28, 2023",
  },
  {
    id: 3,
    user: "Admin User",
    action: "Phase Updated",
    details: "Design Phase Started",
    time: "Nov 01, 2023",
  },
];

export const initialSettings = {
  siteName: "AkaTech IT Solutions",
  emailNotifications: true,
  maintenanceMode: false,
  theme: "light",
  adminEmail: "admin@akatech.com",
  cookiePolicyVersion: "1.0.0",
  enforceSecureCookies: true,
};

export const initialMessages = [
  {
    id: 1,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    subject: "Service Inquiry",
    message:
      "I'm interested in your cloud migration services. Can we schedule a call?",
    date: "2023-12-20T10:30:00",
    read: false,
    type: "contact",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "m.brown@techcorp.com",
    subject: "Partnership Opportunity",
    message:
      "We would like to discuss a potential partnership for our upcoming project.",
    date: "2023-12-19T15:45:00",
    read: true,
    type: "contact",
  },
];

export const initialSubscriptions = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    userEmail: "client@gmail.com",
    plan: "Enterprise Growth",
    status: "active",
    startDate: "2023-10-15",
    endDate: "2024-10-15",
    amount: "6,500",
    billingCycle: "Annual",
  },
  {
    id: 2,
    userId: 2,
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    plan: "Startup Identity",
    status: "pending",
    startDate: "2023-11-01",
    endDate: "2024-11-01",
    amount: "2,500",
    billingCycle: "Annual",
  },
  {
    id: 3,
    userId: 3,
    userName: "Robert Johnson",
    userEmail: "robert@techcorp.com",
    plan: "Premium Commerce",
    status: "expired",
    startDate: "2022-09-01",
    endDate: "2023-09-01",
    amount: "12,000+",
    billingCycle: "Annual",
  },
];

// Simple simulation of a database service
class MockService {
  constructor() {
    // Load from localStorage or use initial data
    this.users = JSON.parse(localStorage.getItem("users")) || initialUsers;
    this.projects =
      JSON.parse(localStorage.getItem("projects")) || initialProjects;
    this.invoices =
      JSON.parse(localStorage.getItem("invoices")) || initialInvoices;
    this.tickets =
      JSON.parse(localStorage.getItem("tickets")) || initialTickets;
    this.activities =
      JSON.parse(localStorage.getItem("activities")) || initialActivities;
    this.settings =
      JSON.parse(localStorage.getItem("settings")) || initialSettings;
    this.messages =
      JSON.parse(localStorage.getItem("messages")) || initialMessages;
    this.subscriptions =
      JSON.parse(localStorage.getItem("subscriptions")) || initialSubscriptions;
  }

  _save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    if (key === "subscriptions") {
      window.dispatchEvent(new Event("subscriptionUpdated"));
    }
  }

  getUsers() {
    return this.users;
  }

  saveUser(user) {
    if (user.id) {
      this.users = this.users.map((u) => (u.id === user.id ? user : u));
    } else {
      const newUser = {
        ...user,
        id: this.users.length + 1,
        status: "Active",
        avatar: user.name
          .split(" ")
          .map((n) => n[0])
          .join(""),
      };
      this.users = [...this.users, newUser];
    }
    this._save("users", this.users);
  }

  updateUser(updatedUser) {
    this.users = this.users.map((u) =>
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    );
    this._save("users", this.users);
  }

  updateAvatar(userId, avatarDataUrl) {
    this.users = this.users.map((u) =>
      u.id === userId ? { ...u, avatarUrl: avatarDataUrl } : u
    );
    this._save("users", this.users);
    return avatarDataUrl;
  }

  syncGoogleAvatar(userId) {
    // Mock Google Avatar URL
    const googleAvatar =
      "https://lh3.googleusercontent.com/a/default-user=s96-c";
    this.users = this.users.map((u) =>
      u.id === userId ? { ...u, avatarUrl: googleAvatar } : u
    );
    this._save("users", this.users);
    return googleAvatar;
  }

  deleteUser(id) {
    this.users = this.users.filter((u) => u.id !== id);
    this._save("users", this.users);
  }

  getProjects(clientId = null) {
    if (clientId) return this.projects.filter((p) => p.clientId === clientId);
    return this.projects;
  }

  saveProject(project) {
    if (project.id) {
      return this.updateProject(project.id, project);
    }
    return this.addProject(project);
  }

  addProject(project) {
    const newProject = {
      ...project,
      id: this.projects.length + 1,
      phases: [],
      files: [],
      progress: 0,
    };
    this.projects = [...this.projects, newProject];
    this._save("projects", this.projects);
    return newProject;
  }

  deleteProject(id) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this._save("projects", this.projects);
  }

  updateProject(id, updates) {
    this.projects = this.projects.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    this._save("projects", this.projects);
    return this.projects.find((p) => p.id === id);
  }

  getInvoices(clientId = null) {
    if (clientId) return this.invoices.filter((i) => i.clientId === clientId);
    return this.invoices;
  }

  saveInvoice(invoice) {
    if (invoice.id) {
      // update logic if needed
      return invoice;
    }
    return this.createInvoice(invoice);
  }

  createInvoice(invoice) {
    const newInvoice = {
      ...invoice,
      id: `INV-2023-${String(this.invoices.length + 1).padStart(3, "0")}`,
    };
    this.invoices = [...this.invoices, newInvoice];
    this._save("invoices", this.invoices);
    return newInvoice;
  }

  getTickets(clientId = null) {
    if (clientId) return this.tickets.filter((t) => t.clientId === clientId);
    return this.tickets;
  }

  updateTicketStatus(id, status) {
    this.tickets = this.tickets.map((t) =>
      t.id === id ? { ...t, status } : t
    );
    this._save("tickets", this.tickets);
  }

  createTicket(ticket) {
    const messages = [];
    if (ticket.message && ticket.sender) {
      messages.push({
        sender: ticket.sender,
        text: ticket.message,
        time: new Date().toISOString(),
      });
    }

    const newTicket = {
      ...ticket,
      id: `TKT-${1000 + this.tickets.length + 1}`,
      messages: messages,
      lastUpdate: "Just now",
    };
    this.tickets = [...this.tickets, newTicket];
    this._save("tickets", this.tickets);
    return newTicket;
  }

  replyTicket(ticketId, message) {
    this.tickets = this.tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, message],
          lastUpdate: "Just now",
          status: message.sender === "Support" ? "In Progress" : "Open",
        };
      }
      return t;
    });
    this._save("tickets", this.tickets);
  }

  getActivities() {
    return this.activities;
  }

  getSettings() {
    return this.settings;
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this._save("settings", this.settings);
    return this.settings;
  }

  getMessages() {
    return this.messages;
  }

  deleteMessage(id) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this._save("messages", this.messages);
  }

  markMessageRead(id) {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, read: true } : m
    );
    this._save("messages", this.messages);
  }

  getSubscriptions() {
    return this.subscriptions;
  }

  updateSubscriptionStatus(id, status) {
    this.subscriptions = this.subscriptions.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    this._save("subscriptions", this.subscriptions);
  }

  addSubscription(subscription) {
    const newSubscription = {
      ...subscription,
      id: this.subscriptions.length + 1,
      status: "pending",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0], // Default 1 year
    };
    this.subscriptions = [...this.subscriptions, newSubscription];
    this._save("subscriptions", this.subscriptions);
    return newSubscription;
  }

  extendSubscription(id, months) {
    this.subscriptions = this.subscriptions.map((s) => {
      if (s.id === id) {
        const endDate = new Date(s.endDate);
        endDate.setMonth(endDate.getMonth() + months);
        return { ...s, endDate: endDate.toISOString().split("T")[0] };
      }
      return s;
    });
    this._save("subscriptions", this.subscriptions);
  }
}

export const mockService = new MockService();
