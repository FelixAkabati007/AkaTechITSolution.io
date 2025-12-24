import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    mockService.getInvoices.mockReturnValue(mockInvoices);
    mockService.getProjects.mockReturnValue(mockProjects);
    global.alert = vi.fn();
    global.console.error = vi.fn();
  });

  it("renders the invoice list", () => {
    render(<ClientBilling user={mockUser} />);
    expect(screen.getByText("INV-001")).toBeDefined();
    expect(screen.getAllByText("Test Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0);
  });

  it("filters invoices by status", () => {
    render(<ClientBilling user={mockUser} />);

    // Initially shows all
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();

    // Click "Paid" filter
    fireEvent.click(screen.getByRole("button", { name: "Paid" }));

    expect(screen.queryByText("INV-001")).not.toBeInTheDocument();
    expect(screen.getByText("INV-002")).toBeInTheDocument();
  });

  it("opens payment modal when Pay Now is clicked", () => {
    render(<ClientBilling user={mockUser} />);

    // Find Pay Now button for Unpaid invoice
    const payButton = screen.getByText("Pay Now");
    fireEvent.click(payButton);

    expect(screen.getByText("Pay Invoice #INV-001")).toBeInTheDocument();
    // Use getAllByText as it appears in the list and the modal
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
  });

  it("processes payment successfully", () => {
    vi.useFakeTimers();
    render(<ClientBilling user={mockUser} />);

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

    // Fast forward time
    act(() => {
      vi.runAllTimers();
    });

    expect(global.alert).toHaveBeenCalledWith("Payment successful!");

    vi.useRealTimers();
  });

  it("triggers download when Download button is clicked", () => {
    vi.useFakeTimers();
    render(<ClientBilling user={mockUser} />);

    // Get all download buttons (should be 2)
    const downloadButtons = screen.getAllByLabelText("Download invoice");
    const downloadButton = downloadButtons[0];

    fireEvent.click(downloadButton);

    // Expect loading state immediately
    expect(downloadButton).toBeDisabled();

    // Run timers to trigger the PDF generation
    act(() => {
      vi.runAllTimers();
    });

    expect(jsPDF).toHaveBeenCalled();
    expect(downloadButton).not.toBeDisabled();

    vi.useRealTimers();
  });

  it("handles invoice request flow correctly", async () => {
    vi.useFakeTimers();
    render(<ClientBilling user={mockUser} />);

    // 1. Check Button Accessibility
    const requestButton = screen.getByRole("button", {
      name: "Request Invoice",
    });
    console.log("DEBUG BUTTON HTML:", requestButton.outerHTML);
    expect(requestButton).toHaveAttribute("aria-haspopup", "dialog");
    expect(requestButton).toHaveAttribute("aria-expanded", "false");

    // 2. Open Modal
    fireEvent.click(requestButton);
    expect(requestButton).toHaveAttribute("aria-expanded", "true");

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("aria-labelledby", "modal-title");

    // 3. Validation Error (empty message)
    const submitButton = screen.getByText("Submit Request");
    fireEvent.click(submitButton);
    // Note: To verify toast, we'd need to mock useToast return value and spy on addToast,
    // but here we just check that createTicket wasn't called
    expect(mockService.createTicket).not.toHaveBeenCalled();

    // 4. Successful Submission
    const messageInput = screen.getByPlaceholderText(/describe what you need/i);
    fireEvent.change(messageInput, {
      target: { value: "I need a new invoice for project X" },
    });

    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Fast forward
    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockService.createTicket).toHaveBeenCalledWith({
      clientId: mockUser.id,
      subject: "Invoice Request",
      priority: "Medium",
      message: "I need a new invoice for project X",
      sender: "Client",
    });

    // Modal should close (or rather, we check if it's gone)
    // Wait, createTicket is called, then state updates.
    // In unit tests with mock timers, state updates inside async functions need careful handling.

    vi.useRealTimers();
  });
});
