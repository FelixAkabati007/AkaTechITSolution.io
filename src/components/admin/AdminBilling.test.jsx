import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AdminBilling } from "./AdminBilling";

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
};

vi.mock("socket.io-client", () => ({
  io: () => mockSocket,
}));

// Mock ToastProvider
const mockAddToast = vi.fn();
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock SyncStatusProvider
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: () => ({
    status: "synced",
    socket: mockSocket,
  }),
}));

// Mock Local Data
vi.mock("@lib/localData", () => ({
  localDataService: {
    getInvoices: () => [],
    getProjects: () => [{ id: "proj1", title: "Test Project" }],
  },
}));

describe("AdminBilling Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default fetch mock returning successful empty response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
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

    // Setup default socket.on behavior
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "connect") callback();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches invoices and audit logs on mount", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/admin/invoices")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: "INV-1",
                referenceNumber: "INV-1",
                amount: 100,
                status: "sent",
                createdAt: new Date().toISOString(),
              },
            ]),
        });
      }
      if (url.includes("/api/admin/audit-logs")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                action: "TEST_ACTION",
                timestamp: new Date().toISOString(),
              },
            ]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<AdminBilling />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/invoices"),
        expect.anything()
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/audit-logs"),
        expect.anything()
      );
    });

    expect(screen.getByText("INV-1")).toBeInTheDocument();
  });

  it("displays sync status indicator", async () => {
    render(<AdminBilling />);
    // Initial render should show status indicator (green if connect callback ran)
    // We mocked connect callback to run immediately in beforeEach

    // Check for title attribute
    const indicator = screen.getByTitle(/Sync Status: synced/i);
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("bg-green-500");
  });

  it("toggles audit logs view", async () => {
    // Override fetch for this test
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/admin/audit-logs")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                action: "TEST_LOG",
                timestamp: new Date().toISOString(),
                performedBy: "Admin",
                details: "{}",
              },
            ]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<AdminBilling />);

    const toggleBtn = screen.getByText(/Audit Logs/i);
    fireEvent.click(toggleBtn);

    // Wait for the section to appear
    const sectionHeader = await screen.findByText("System Audit Logs");
    expect(sectionHeader).toBeInTheDocument();

    // Wait for the specific log entry
    // Using findByText with a regex to be more flexible with surrounding whitespace/elements
    const logEntry = await screen.findByText(/TEST_LOG/);
    expect(logEntry).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Hide Logs/i));
    await waitFor(() => {
      expect(screen.queryByText("System Audit Logs")).not.toBeInTheDocument();
    });
  });

  it("requires verification for approving/sending invoice", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<AdminBilling />);

    // Open Modal
    const createBtn = screen.getByText("Create Invoice");
    fireEvent.click(createBtn);

    // Wait for modal content
    const modalTitle = await screen.findByText("Create New Invoice");
    expect(modalTitle).toBeInTheDocument();

    // Fill Form
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: "500" } });

    const dateInput = screen.getByLabelText(/Due Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-01-01" } });

    // Select Status "Sent"
    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: "Sent" } });

    // Submit button should be disabled initially for "Sent" status without verification
    // Note: The button text is "Generate Invoice" when not in edit mode
    const submitBtn = screen.getByRole("button", { name: /Generate Invoice/i });

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Check verification box
    const verifyCheckbox = screen.getByLabelText(
      /I have verified the transaction details/i
    );
    fireEvent.click(verifyCheckbox);
    expect(verifyCheckbox).toBeChecked();

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });
});
