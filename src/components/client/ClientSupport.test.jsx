import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientSupport } from "./ClientSupport";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Plus: () => <div data-testid="icon-plus" />,
    LifeBuoy: () => <div data-testid="icon-life-buoy" />,
    X: () => <div data-testid="icon-x" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
    Loader: () => <div data-testid="icon-loader" />,
    Send: () => <div data-testid="icon-send" />,
  },
}));

// Mock ToastProvider
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("ClientSupport", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
  };

  const mockTickets = [
    {
      id: "t1",
      subject: "Test Ticket 1",
      status: "Open",
      priority: "High",
      createdAt: "2023-01-01",
      messages: [],
    },
    {
      id: "t2",
      subject: "Test Ticket 2",
      status: "Closed",
      priority: "Normal",
      createdAt: "2023-01-02",
      messages: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/client/tickets") && !url.includes("POST")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTickets),
        });
      }
      if (url.includes("/api/tickets") && !url.includes("PATCH")) {
        // POST new ticket
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  it("renders support dashboard with tickets", async () => {
    render(<ClientSupport user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      expect(screen.getByText("Test Ticket 1")).toBeInTheDocument();
      expect(screen.getByText("Test Ticket 2")).toBeInTheDocument();
    });
  });

  it("opens new ticket modal", async () => {
    render(<ClientSupport user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New Ticket"));
    expect(screen.getByText("Create New Ticket")).toBeInTheDocument();
  });

  it("submits a new ticket", async () => {
    render(<ClientSupport user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("New Ticket"));

    // Fill form
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: "New Issue" },
    });
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: "Urgent" },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Help needed" },
    });

    // Submit
    fireEvent.click(screen.getByText("Submit Ticket"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tickets"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Issue"),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Create New Ticket")).not.toBeInTheDocument();
    });
  });
});
