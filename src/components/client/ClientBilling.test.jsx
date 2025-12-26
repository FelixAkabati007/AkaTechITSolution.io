import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { ClientBilling } from "./ClientBilling";
import { mockService } from "@lib/mockData";
import { jsPDF } from "jspdf";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    ShoppingBag: () => <div data-testid="icon-shopping-bag" />,
    Download: () => <div data-testid="icon-download" />,
    CreditCard: () => <div data-testid="icon-credit-card" />,
    Lock: () => <div data-testid="icon-lock" />,
    X: () => <div data-testid="icon-x" />,
    Loader: () => <div data-testid="icon-loader" />,
  },
}));

// Mock ToastProvider
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// Mock Service
vi.mock("@lib/mockData", () => ({
  mockService: {
    getInvoices: vi.fn(),
    getProjects: vi.fn(),
    createTicket: vi.fn(),
  },
}));

// Mock Config
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://localhost:3000/api",
}));

// Mock jsPDF
vi.mock("jspdf", () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      text: vi.fn(),
      save: vi.fn(),
    })),
  };
});

describe("ClientBilling", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
  };

  const mockInvoices = [
    {
      id: "INV-001",
      projectId: 101,
      date: "2023-01-01",
      dueDate: "2023-02-01",
      amount: 1000.0,
      status: "Unpaid",
    },
    {
      id: "INV-002",
      projectId: 101,
      date: "2023-01-01",
      dueDate: "2023-02-01",
      amount: 2000.0,
      status: "Paid",
    },
  ];

  const mockProjects = [{ id: 101, title: "Test Project" }];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Ensure real timers by default
    mockService.getInvoices.mockReturnValue(mockInvoices);
    mockService.getProjects.mockReturnValue(mockProjects);
    global.alert = vi.fn();
    global.console.error = vi.fn();

    // Mock fetch to fail by default so it falls back to mockService
    global.fetch = vi.fn(() => Promise.reject("API Offline"));
  });

  it("renders the invoice list", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeDefined();
    });

    expect(screen.getAllByText("Test Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0);
  });

  it("filters invoices by status", async () => {
    render(<ClientBilling user={mockUser} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeInTheDocument();
    });
    expect(screen.getByText("INV-002")).toBeInTheDocument();

    // Click "Paid" filter
    fireEvent.click(screen.getByRole("button", { name: "Paid" }));

    expect(screen.queryByText("INV-001")).not.toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();
  });

  it("opens payment modal when Pay Now is clicked", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Pay Now")).toBeInTheDocument();
    });

    // Find Pay Now button for Unpaid invoice
    const payButton = screen.getByText("Pay Now");
    fireEvent.click(payButton);

    expect(screen.getByText("Pay Invoice #INV-001")).toBeInTheDocument();
    // Use getAllByText as it appears in the list and the modal
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
  });

  it("processes payment successfully", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("Pay Now")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Pay Now"));

    // Fill payment form
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
      target: { value: "1234123412341234" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), {
      target: { value: "12/25" },
    });
    fireEvent.change(screen.getByPlaceholderText("123"), {
      target: { value: "123" },
    });

    // Submit
    const submitButton = screen.getByText(/Pay GH₵/);
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText("Processing...")).toBeInTheDocument();

    // Wait for real timeout (2000ms + buffer)
    await waitFor(
      () => {
        expect(global.alert).toHaveBeenCalledWith("Payment successful!");
      },
      { timeout: 3000 }
    );
  });

  it("triggers download when Download button is clicked", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(
        screen.getAllByLabelText("Download invoice").length
      ).toBeGreaterThan(0);
    });

    // Get all download buttons (should be 2)
    const downloadButtons = screen.getAllByLabelText("Download invoice");
    const downloadButton = downloadButtons[0];

    fireEvent.click(downloadButton);

    // Expect loading state immediately
    expect(downloadButton).toBeDisabled();

    // Wait for real timeout (100ms in component)
    await waitFor(
      () => {
        expect(jsPDF).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    expect(downloadButton).not.toBeDisabled();
  });

  it("handles invoice request flow correctly", async () => {
    // Setup fetch mock
    global.fetch = vi.fn((url) => {
      if (url.includes("/invoices/request")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              message: "Success",
              invoice: {
                id: "INV-NEW",
                referenceNumber: "REQ-NEW",
                projectId: 101,
                amount: 0,
                status: "requested",
                createdAt: new Date().toISOString(),
                description: "Test Description",
              },
            }),
        });
      }
      if (url.includes("/client/projects")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProjects),
        });
      }
      if (url.includes("/client/invoices")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject("Unknown URL: " + url);
    });

    vi.useFakeTimers();
    render(<ClientBilling user={mockUser} />);

    // Wait for projects to load (useEffect)
    await act(async () => {});

    // 1. Check Button Accessibility
    const requestButton = screen.getByRole("button", {
      name: "Request Invoice",
    });
    expect(requestButton).toHaveAttribute("aria-haspopup", "dialog");
    expect(requestButton).toHaveAttribute("aria-expanded", "false");

    // 2. Open Modal
    fireEvent.click(requestButton);
    expect(requestButton).toHaveAttribute("aria-expanded", "true");

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // 3. Validation Error (empty message and project)
    const submitButton = screen.getByText("Submit Request");
    fireEvent.click(submitButton);
    // Fetch should NOT be called
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/invoices/request"),
      expect.any(Object)
    );

    // 4. Fill form
    // Select Project
    const projectSelect = screen.getByRole("combobox"); // Assuming it's the only select or use label
    fireEvent.change(projectSelect, { target: { value: "101" } });

    // Enter Message
    const messageInput = screen.getByPlaceholderText(/describe what you need/i);
    fireEvent.change(messageInput, {
      target: { value: "I need a new invoice for project X" },
    });

    // 5. Successful Submission
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Fast forward (fetch is async but we awaited res.json so it might be microtask)
    // In real fetch, we await. In mock, it resolves immediately.
    await act(async () => {});

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/invoices/request"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          subject: "Invoice Request",
          message: "I need a new invoice for project X",
          projectId: "101",
        }),
      })
    );

    vi.useRealTimers();
  });
});
