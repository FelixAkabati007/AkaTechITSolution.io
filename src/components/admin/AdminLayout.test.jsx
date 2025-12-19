import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AdminLayout } from "./AdminLayout";

// Mock child components
vi.mock("./AdminDashboard", () => ({
  AdminDashboard: () => <div>Dashboard Component</div>,
}));
vi.mock("./AdminClients", () => ({
  AdminClients: () => <div>Clients Component</div>,
}));
vi.mock("./AdminProjects", () => ({
  AdminProjects: () => <div>Projects Component</div>,
}));
vi.mock("./AdminBilling", () => ({
  AdminBilling: () => <div>Billing Component</div>,
}));
vi.mock("./AdminSupport", () => ({
  AdminSupport: () => <div>Support Component</div>,
}));
vi.mock("./AdminSettings", () => ({
  AdminSettings: () => <div>Settings Component</div>,
}));
vi.mock("./AdminProfile", () => ({
  AdminProfile: () => <div>Profile Component</div>,
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    LayoutDashboard: () => <span>DashboardIcon</span>,
    Users: () => <span>UsersIcon</span>,
    Briefcase: () => <span>BriefcaseIcon</span>,
    CreditCard: () => <span>CreditCardIcon</span>,
    LifeBuoy: () => <span>LifeBuoyIcon</span>,
    Settings: () => <span>SettingsIcon</span>,
    LogOut: () => <span>LogOutIcon</span>,
    ChevronLeft: () => <span>ChevronLeftIcon</span>,
    ChevronRight: () => <span>ChevronRightIcon</span>,
    Menu: () => <span>MenuIcon</span>,
    User: () => <span>UserIcon</span>,
  },
}));

// Mock Logo
vi.mock("@components/ui/Logo", () => ({ Logo: () => <span>Logo</span> }));

describe("AdminLayout", () => {
  const mockUser = {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "A",
  };
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders layout with dashboard by default", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Dashboard Component")).toBeDefined();
    expect(screen.getByText("AkaTech Admin")).toBeDefined();
  });

  it("toggles profile dropdown", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Dropdown should be closed initially
    const dropdownToggle = screen.getByLabelText("User menu");
    expect(dropdownToggle.getAttribute("aria-expanded")).toBe("false");

    // Click to open
    fireEvent.click(dropdownToggle);
    expect(dropdownToggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menu")).toBeDefined();
    expect(screen.getByText("admin@example.com")).toBeDefined();
  });

  it("navigates to Profile when Profile button in dropdown is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText("User menu"));

    // Click Profile button inside menu
    const menu = screen.getByRole("menu");
    const profileButton = within(menu).getByText("Profile").closest("button");
    fireEvent.click(profileButton);

    // Should render Profile Component
    expect(screen.getByText("Profile Component")).toBeDefined();
  });

  it("navigates to Settings when Settings button in dropdown is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText("User menu"));

    // Click Settings button inside menu
    const menu = screen.getByRole("menu");
    const settingsButton = within(menu).getByText("Settings").closest("button");
    fireEvent.click(settingsButton);

    // Should render Settings Component
    expect(screen.getByText("Settings Component")).toBeDefined();
  });

  it("calls onLogout when Sign Out in dropdown is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText("User menu"));

    // Click Sign Out button inside menu
    const menu = screen.getByRole("menu");
    const signOutButton = within(menu).getByText("Sign Out").closest("button");
    fireEvent.click(signOutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it("sidebar navigation works", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Click Clients tab (sidebar)
    // Note: Clients is unique enough, but safe to scope if needed.
    // But "Clients" text only appears in sidebar.
    fireEvent.click(screen.getByText("Clients"));
    expect(screen.getByText("Clients Component")).toBeDefined();
  });
});
