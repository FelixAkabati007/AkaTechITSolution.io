import { Icons } from "@components/ui/Icons";

// In-memory store for projects to support runtime CRUD
let usersStore = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Client",
    company: "Acme Corp",
    avatar: null,
    accountType: "manual",
    joinedAt: "2023-01-15T10:00:00Z",
    status: "Verified",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Client",
    company: "Global Tech",
    avatar: null,
    accountType: "google",
    joinedAt: "2023-03-22T14:30:00Z",
    status: "Verified",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@akatech.com",
    role: "Admin",
    company: "AkaTech",
    accountType: "manual",
    joinedAt: "2022-11-01T09:00:00Z",
    status: "Verified",
  },
];

let projectsStore = [
  {
    id: 1,
    title: "E-Commerce Website Redesign",
    clientId: 1,
    status: "In Progress",
    description: "Complete overhaul of the online store with modern UI/UX.",
    currentPhase: "Development",
    phases: [
      { name: "Design", status: "Completed", date: "2023-10-15" },
      { name: "Development", status: "In Progress", date: "2023-11-20" },
      { name: "Testing", status: "Pending", date: "-" },
    ],
    files: [{ name: "Design_Mockups.pdf", date: "2023-10-10", size: "2.5 MB" }],
  },
  {
    id: 2,
    title: "Mobile App Development",
    clientId: 1,
    status: "Pending",
    description: "Native mobile application for iOS and Android.",
    currentPhase: "Discovery",
    phases: [
      { name: "Discovery", status: "In Progress", date: "2023-12-01" },
      { name: "Design", status: "Pending", date: "-" },
    ],
    files: [],
  },
  {
    id: 3,
    title: "Inventory Management System",
    clientId: 2,
    status: "Completed",
    description: "Custom inventory tracking for warehouse operations.",
    currentPhase: "Maintenance",
    phases: [
      { name: "Development", status: "Completed", date: "2023-09-01" },
      { name: "Deployment", status: "Completed", date: "2023-09-15" },
    ],
    files: [{ name: "User_Manual.pdf", date: "2023-09-15", size: "1.2 MB" }],
  },
];

export const mockService = {
  getProjects: (clientId = null) => {
    if (clientId) {
      return projectsStore.filter((p) => p.clientId === clientId);
    }
    return projectsStore;
  },
  getUsers: () => {
    return usersStore;
  },
  getAuditLogs: () => {
    return auditLogs;
  },
  saveUser: (user) => {
    if (user.id) {
      usersStore = usersStore.map((u) =>
        u.id === user.id ? { ...u, ...user } : u
      );
    } else {
      const newUser = {
        ...user,
        id: usersStore.length + 1,
        joinedAt: new Date().toISOString(),
        status: "Unverified",
      };
      usersStore.push(newUser);
      return newUser;
    }
    return user;
  },
  deleteUser: (id) => {
    const userToDelete = usersStore.find((u) => u.id === id);
    if (!userToDelete) {
      console.warn(`Attempted to delete non-existent user with ID ${id}`);
      return false;
    }

    // Log pre-removal state
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} - Initiating deletion for user:`, userToDelete);

    // Cascading delete: Remove associated projects
    const userProjects = projectsStore.filter((p) => p.clientId === id);
    const projectIds = userProjects.map((p) => p.id);
    
    projectsStore = projectsStore.filter((p) => p.clientId !== id);
    console.log(`[AUDIT] Deleted ${userProjects.length} associated projects:`, projectIds);

    // Remove user
    usersStore = usersStore.filter((u) => u.id !== id);
    
    // Log post-removal
    auditLogs.push({
      action: "DELETE_USER",
      targetId: id,
      targetName: userToDelete.name,
      timestamp,
      details: {
        deletedProjects: projectIds,
        userEmail: userToDelete.email
      }
    });
    console.log(`[AUDIT] User deletion completed successfully.`);
    return true;
  },
  saveProject: (project) => {
    if (project.id) {
      // Update existing
      projectsStore = projectsStore.map((p) =>
        p.id === project.id ? { ...p, ...project } : p
      );
    } else {
      // Create new
      const newProject = {
        ...project,
        id: Math.max(...projectsStore.map((p) => p.id), 0) + 1,
        phases: project.phases || [],
        files: project.files || [],
        currentPhase: project.currentPhase || "Discovery",
      };
      projectsStore.push(newProject);
      return newProject;
    }
    return project;
  },
  deleteProject: (id) => {
    projectsStore = projectsStore.filter((p) => p.id !== id);
  },
  getInvoices: (userId) => {
    return [
      {
        id: "INV-001",
        projectId: "E-Commerce Website Redesign",
        amount: 2500.0,
        status: "Paid",
        date: "2023-10-01",
        dueDate: "2023-10-15",
        description: "Initial deposit",
      },
      {
        id: "INV-002",
        projectId: "Mobile App Development",
        amount: 5000.0,
        status: "Pending",
        date: "2023-12-01",
        dueDate: "2023-12-15",
        description: "Milestone 1 payment",
      },
    ];
  },
  createTicket: (ticket) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...ticket,
      messages: [
        { text: ticket.message, sender: ticket.sender, timestamp: new Date() },
      ],
      status: "Open",
      createdAt: new Date(),
    };
  },
  getTickets: (clientId) => {
    return [
      {
        id: "TCK-001",
        subject: "Login Issue",
        priority: "High",
        status: "Closed",
        createdAt: "2023-11-05T10:00:00Z",
        messages: [
          {
            text: "I cannot login to the admin panel.",
            sender: "Client",
            timestamp: "2023-11-05T10:00:00Z",
          },
        ],
      },
    ];
  },
  getMessages: () => {
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "Project Update",
        content: "Just wanted to check on the status of the design phase.",
        timestamp: new Date().toISOString(),
        status: "unread",
        direction: "inbound",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Invoice Question",
        content: "I have a question about the latest invoice INV-002.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "read",
        direction: "inbound",
      },
      {
        id: 3,
        name: "Admin User",
        email: "admin@akatech.com",
        subject: "Re: Project Update",
        content: "We are on track and will send updates by EOD.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "read",
        direction: "outbound",
      },
    ];
  },
};
