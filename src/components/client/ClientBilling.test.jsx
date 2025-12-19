import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ClientBilling } from "./ClientBilling";
import { mockService } from "@lib/mockData";
import { jsPDF } from "jspdf";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    ShoppingBag: () => <span>ShoppingBagIcon</span>,
    Download: () => <span>DownloadIcon</span>,
    CreditCard: () => <span>CreditCardIcon</span>,
    Lock: () => <span>LockIcon</span>,
    X: () => <span>XIcon</span>,
  },
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
});
