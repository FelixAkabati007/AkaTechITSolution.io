import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminSupport } from "./AdminSupport";
import { mockService } from "@lib/mockData";

// Mock the Icons component
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>Plus Icon</span>,
    PenTool: () => <span>Edit Icon</span>,
    Trash: () => <span>Delete Icon</span>,
    User: () => <span>User Icon</span>,
    Download: () => <span>Download Icon</span>,
    MessageSquare: () => <span>Message Icon</span>,
    Check: () => <span>CheckIcon</span>,
    Clock: () => <span>ClockIcon</span>,
    MoreHorizontal: () => <span>MoreHorizontalIcon</span>,
    X: () => <span>XIcon</span>,
    Search: () => <span>SearchIcon</span>,
    Filter: () => <span>FilterIcon</span>,
    Calendar: () => <span>CalendarIcon</span>,
    ChevronRight: () => <span>ChevronRightIcon</span>,
  },
}));

// Mock config
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://test-api.com",
  getSocketUrl: () => "http://test-socket.com",
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AdminSupport", () => {
  beforeEach(() => {
    localStorage.setItem("adminToken", "test-token");
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.removeItem("adminToken");
  });

  it("renders ticket list and allows updating status", async () => {
    const mockTickets = [
      {
        id: "1234567890",
        subject: "Issue 1",
        clientId: 1,
        priority: "High",
        status: "Open",
        message: "This is a test issue",
        userName: "Client One",
        userEmail: "client@example.com",
      },
    ];

    global.fetch = vi.fn((url, options) => {
      if (url.includes("/tickets") && options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      if (url.includes("/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTickets),
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });

    render(<AdminSupport />);

    await waitFor(() => {
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      expect(screen.getByText("Issue 1")).toBeInTheDocument();
    });

    // Change status
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "in-progress" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/tickets/1234567890"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "in-progress" }),
        })
      );
    });
  });
});
