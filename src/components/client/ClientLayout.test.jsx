import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientLayout } from "./ClientLayout";
import React from "react";

// Mock child components to avoid rendering complexity
vi.mock("./ClientDashboard", () => ({
  ClientDashboard: () => <div data-testid="dashboard" />,
}));
vi.mock("./ClientProjects", () => ({
  ClientProjects: () => <div data-testid="projects" />,
}));
vi.mock("./ClientBilling", () => ({
  ClientBilling: () => <div data-testid="billing" />,
}));
vi.mock("./ClientSupport", () => ({
  ClientSupport: () => <div data-testid="support" />,
}));
vi.mock("./ClientProfile", () => ({
  ClientProfile: () => <div data-testid="profile" />,
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    LayoutDashboard: () => <div />,
    Briefcase: () => <div />,
    CreditCard: () => <div />,
    LifeBuoy: () => <div />,
    User: () => <div />,
    ChevronLeft: () => <div />,
    ChevronRight: () => <div />,
    LogOut: () => <div />,
    Menu: () => <div />,
    Bell: () => <div data-testid="icon-bell" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
    Loader: () => <div data-testid="icon-loader" />,
  },
}));

// Mock Avatar
vi.mock("@components/ui/Avatar", () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  })),
}));

// Mock config
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://localhost:3000/api",
  getSocketUrl: () => "http://localhost:3000",
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, ...props }) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("ClientLayout Notification Button", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    avatarUrl: "test.jpg",
  };

  const mockNotifications = [
    { id: 1, title: "Welcome to AkaTech", read: false },
    { id: 2, title: "Invoice Paid", read: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/notifications/read-all")) {
        return Promise.resolve({ ok: true });
      }
      if (url.includes("/notifications")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockNotifications),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("renders the notification button with unread count", async () => {
    render(<ClientLayout user={mockUser} />);

    // Check for button
    const button = screen.getByRole("button", { name: /Notifications/i });
    expect(button).toBeInTheDocument();

    // Check for bell icon
    expect(screen.getByTestId("icon-bell")).toBeInTheDocument();

    // Wait for unread count to appear in aria-label (simulated network delay)
    await waitFor(
      () => {
        expect(button).toHaveAttribute(
          "aria-label",
          expect.stringMatching(/unread/i)
        );
      },
      { timeout: 2000 }
    );
  });

  it("shows loading state when opening dropdown initially", () => {
    // Override fetch to delay
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves to keep loading state?
    // Actually ClientLayout fetches on mount, so loading state is true initially.
    // But we need to make sure it STAYS true or we catch it.

    // Wait, ClientLayout sets isLoadingNotifications to true initially.
    // fetchNotifications runs on mount.
    // If we want to test loading state inside the dropdown, we need to click it.

    render(<ClientLayout user={mockUser} />);
    const button = screen.getByRole("button", { name: /Notifications/i });

    fireEvent.click(button);
    // Since fetch is mocked to resolve immediately in beforeEach, we might miss the loading state if we don't delay it.
    // But let's see if it works with default mock.
    // Actually, if we click immediately, it might show loading if fetch hasn't resolved?
    // But fetch is async (microtask). Render is sync.
    // So if we click immediately after render, the state update from fetch hasn't happened yet.

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
    expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
  });

  it("toggles notification dropdown on click", async () => {
    render(<ClientLayout user={mockUser} />);

    const button = screen.getByRole("button", { name: /Notifications/i });

    // Click to open
    fireEvent.click(button);

    // Wait for content to load
    await waitFor(
      () => {
        expect(screen.getByText("Welcome to AkaTech")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(button).toHaveAttribute("aria-expanded", "true");

    // Click to close
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText("Welcome to AkaTech")).not.toBeInTheDocument();
    });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("marks notifications as read", async () => {
    render(<ClientLayout user={mockUser} />);

    const button = screen.getByRole("button", { name: /Notifications/i });
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByText("Mark all read")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Click "Mark all read"
    fireEvent.click(screen.getByText("Mark all read"));

    // Wait for state update (button should disappear when all are read)
    await waitFor(() => {
      expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ClientLayout user={mockUser} />
      </div>
    );

    const button = screen.getByRole("button", { name: /Notifications/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Welcome to AkaTech")).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByText("Welcome to AkaTech")).not.toBeInTheDocument();
    });
  });
});
