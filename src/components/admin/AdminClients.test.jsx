import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AdminClients } from "./AdminClients";

const mocks = vi.hoisted(() => {
  return {
    addToast: vi.fn(),
  };
});
const mockToast = mocks.addToast;

// Mock dependencies
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Plus: () => <div data-testid="icon-plus" />,
    DollarSign: () => <div data-testid="icon-dollar-sign" />,
    Clock: () => <div data-testid="icon-clock" />,
    Users: () => <div data-testid="icon-users" />,
    FileText: () => <div data-testid="icon-file-text" />,
    PenTool: () => <div data-testid="icon-pen-tool" />,
    Trash: () => <div data-testid="icon-trash" />,
    Loader: () => <div data-testid="icon-loader" />,
  },
}));

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
};
vi.mock("socket.io-client", () => ({
  io: () => mockSocket,
}));

// Mock jsPDF
vi.mock("jspdf", () => {
  return {
    jsPDF: class {
      constructor() {
        this.text = vi.fn();
        this.setFontSize = vi.fn();
        this.setFont = vi.fn();
        this.line = vi.fn();
        this.output = vi.fn(() => "data:application/pdf;base64,mockpdfcontent");
        this.save = vi.fn();
      }
    },
  };
});

// Mock Local Data
vi.mock("@lib/localData", () => ({
  localDataService: {
    getUsers: () => [
      { id: "u1", name: "User 1", email: "user1@example.com", role: "client" },
      { id: "u2", name: "User 2", email: "user2@example.com", role: "client" },
    ],
    deleteUser: vi.fn(),
  },
}));

describe("AdminClients Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.fetch = global.fetch;

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Default fetch mocks
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/users")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: "u1",
                name: "User 1",
                email: "user1@example.com",
                role: "client",
                joinedAt: new Date().toISOString(),
              },
              {
                id: "u2",
                name: "User 2",
                email: "user2@example.com",
                role: "client",
                joinedAt: new Date().toISOString(),
              },
            ]),
        });
      }
      if (url.includes("/api/admin/invoices")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders users list and supports search", async () => {
    render(<AdminClients />);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("User 2")).toBeInTheDocument();
    });

    // Search
    const searchInput = screen.getByPlaceholderText("Search clients...");
    fireEvent.change(searchInput, { target: { value: "User 1" } });

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.queryByText("User 2")).not.toBeInTheDocument();
    });
  });

  it("opens invoice modal and requires verification", async () => {
    render(<AdminClients />);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
    });

    // Find generate invoice button for User 1 (first row)
    // Note: User 1 is a client, so button should be there.
    const generateBtns = screen.getAllByTitle("Generate Invoice");
    fireEvent.click(generateBtns[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Generate Invoice for User 1")
      ).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(
      screen.getByPlaceholderText("e.g., Web Development Services"),
      {
        target: { value: "Test Invoice" },
      }
    );

    // Fill in invoice details
    fireEvent.change(screen.getByTestId("invoice-due-date"), {
      target: { value: "2023-12-31" },
    });

    // Fill item description
    const itemDescInputs = screen.getAllByPlaceholderText("Item Description");
    fireEvent.change(itemDescInputs[0], {
      target: { value: "Consulting Services" },
    });
    fireEvent.change(screen.getByPlaceholderText("Price"), {
      target: { value: "100" },
    });

    // Try to submit without verification
    const submitBtn = screen.getByText("Generate & Send");
    const form = submitBtn.closest("form");
    fireEvent.submit(form);

    expect(mockToast).toHaveBeenCalledWith(
      expect.stringContaining("verify the invoice details"),
      "error"
    );

    // Check verification
    const verifyCheckbox = screen.getByLabelText(
      /I have verified the invoice details/i
    );
    fireEvent.click(verifyCheckbox);
    expect(verifyCheckbox).toBeChecked();

    // Submit again
    // Mock generate endpoint
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/invoices/generate")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      // Keep other mocks
      if (url.includes("/api/users")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: "u1",
                name: "User 1",
                email: "user1@example.com",
                role: "client",
              },
            ]),
        });
      }
      if (url.includes("/api/admin/invoices"))
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: false });
    });

    fireEvent.submit(screen.getByText("Generate & Send").closest("form"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Invoice generated and sent successfully!",
        "success"
      );
    });
  });
});
