import { mockService } from "./mockData";

export const localDataService = {
  getProjects: (clientId = null) => {
    return mockService.getProjects(clientId);
  },
  getUsers: () => {
    return mockService.getUsers();
  },
  getInvoices: () => {
    return mockService.getInvoices();
  },
  getTickets: () => {
    return mockService.getTickets();
  },
  getMessages: () => {
    return mockService.getMessages();
  },
  getSubscriptions: () => {
    return [
      {
        id: 1,
        plan: "Enterprise Growth",
        amount: "6,500",
        status: "Active",
        client: "John Doe",
      },
      {
        id: 2,
        plan: "Startup Identity",
        amount: "2,500",
        status: "Active",
        client: "Jane Smith",
      },
    ];
  },
  saveProject: (project) => {
    console.log("Saving project locally:", project);
    return mockService.saveProject(project);
  },
  deleteProject: (id) => {
    console.log("Deleting project locally:", id);
    return mockService.deleteProject(id);
  },
  deleteUser: (id) => {
    console.log("Deleting user locally:", id);
    return mockService.deleteUser(id);
  },
  getAuditLogs: () => {
    return mockService.getAuditLogs();
  },
  updateProject: (project) => {
    console.log("Updating project locally:", project);
    return mockService.saveProject(project);
  },
  updateUser: (user) => {
    console.log("Updating user:", user);
    return mockService.saveUser(user);
  },
  updateAvatar: (id, url) => {
    console.log("Updating avatar:", id, url);
    return url;
  },
  syncGoogleAvatar: (id) => {
    console.log("Syncing google avatar:", id);
    return "/default-avatar.png";
  },
  getSettings: () => ({
    siteName: "AkaTech IT Solutions",
    emailNotifications: true,
    maintenanceMode: false,
    theme: "light",
    adminEmail: "admin@akatech.com",
    cookiePolicyVersion: "1.0.0",
    enforceSecureCookies: true,
  }),
  saveSettings: (settings) => {
    console.log("Saving settings:", settings);
    return settings;
  },
};
