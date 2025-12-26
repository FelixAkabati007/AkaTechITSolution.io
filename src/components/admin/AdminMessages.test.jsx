import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminMessages } from "./AdminMessages";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

// Mock config
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://test-api.com",
  getSocketUrl: () => "http://test-socket.com",
}));

// Mock icons
vi.mock("../../components/ui/Icons", () => ({
  Icons: {
    Search: () => <span data-testid="icon-search">Search</span>,
    Filter: () => <span data-testid="icon-filter">Filter</span>,
    Trash: () => <span data-testid="icon-trash">Trash</span>,
    Trash2: () => <span data-testid="icon-trash2">Trash2</span>,
    Mail: () => <span data-testid="icon-mail">Mail</span>,
    MessageSquare: () => <span data-testid="icon-message">Message</span>,
    Check: () => <span data-testid="icon-check">Check</span>,
    Clock: () => <span data-testid="icon-clock">Clock</span>,
    ChevronRight: () => <span data-testid="icon-chevron">Chevron</span>,
    X: () => <span data-testid="icon-close">Close</span>,
    Edit: () => <span data-testid="icon-edit">Edit</span>,
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AdminMessages", () => {
  const mockMessages = [
    {
      id: "1",
      name: "Sender Name",
      email: "sender@example.com",
      subject: "Test Subject",
      content: "Test Message Content",
      timestamp: "2023-01-01T12:00:00Z",
      status: "unread",
      direction: "inbound",
    },
    {
      id: "2",
      name: "Read Sender",
      email: "read@example.com",
      subject: "Read Subject",
      content: "Read Message Content",
      timestamp: "2023-01-02T12:00:00Z",
      status: "read",
      direction: "inbound",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/messages")) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve(mockMessages),
        });
      }
      if (url.includes("/clients")) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => "application/json" },
        json: () => Promise.resolve({}),
      });
    });
    window.confirm = vi.fn(() => true);
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => "mock-token");
  });

  it("renders message list", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Inbox")).toBeInTheDocument();
    });
    expect(screen.getByText("Sender Name")).toBeInTheDocument();
    expect(screen.getByText("Test Subject")).toBeInTheDocument();
  });

  it("filters messages", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Sender Name")).toBeInTheDocument();
    });

    // Default is all
    expect(screen.getByText("Read Sender")).toBeInTheDocument();

    // Filter unread
    const unreadFilterBtn = screen.getByText("unread");
    fireEvent.click(unreadFilterBtn);

    // Check if filtering logic works
    expect(screen.getByText("Sender Name")).toBeInTheDocument();
    expect(screen.queryByText("Read Sender")).not.toBeInTheDocument();
  });

  it("selects a message", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Test Subject")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Test Subject"));

    await waitFor(() => {
      expect(
        screen.getByTitle("Reply internally via Webmail")
      ).toBeInTheDocument();
      expect(screen.getByTitle("Open Outlook Desktop App")).toBeInTheDocument();
    });
  });
});
