import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("ClientLayout Notification Button", () => {
  const mockUser = {
    name: "Test User",
    avatarUrl: "test.jpg",
  };

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
    render(<ClientLayout user={mockUser} />);
    const button = screen.getByRole("button", { name: /Notifications/i });

    fireEvent.click(button);
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
