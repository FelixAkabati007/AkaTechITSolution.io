import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { ClientBilling } from "./ClientBilling";
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
const mockAddToast = vi.fn();
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
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
      referenceNumber: "INV-001",
      projectId: 101,
      createdAt: "2023-01-01T00:00:00.000Z",
      dueDate: "2023-02-01T00:00:00.000Z",
      amount: 1000.0,
      status: "unpaid",
      description: "Test Invoice 1",
    },
    {
      id: "INV-002",
      referenceNumber: "INV-002",
      projectId: 101,
      createdAt: "2023-01-01T00:00:00.000Z",
      dueDate: "2023-02-01T00:00:00.000Z",
      amount: 2000.0,
      status: "paid",
      description: "Test Invoice 2",
    },
  ];

  const mockProjects = [{ id: 101, title: "Test Project" }];

  const localStorageMock = {
    getItem: vi.fn(() => "mock-token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.stubGlobal("localStorage", localStorageMock);

    // Default successful fetch mock
    global.fetch = vi.fn((url) => {
      if (
        url.includes("/client/invoices") &&
        !url.includes("pay") &&
        !url.includes("request")
      ) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve(mockInvoices),
        });
      }
      if (url.includes("/client/projects")) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve(mockProjects),
        });
      }

      // Return 404 for unknown
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: { get: () => "application/json" },
        json: () => Promise.resolve({ error: "Unknown URL" }),
      });
    });
  });

  it("renders the invoice list from API", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeDefined();
    });

    expect(screen.getAllByText("Test Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0);
  });

  it("handles API error gracefully by showing toast", async () => {
    global.fetch = vi.fn(() => Promise.reject("API Error"));

    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining("Failed to load billing data"),
        "error"
      );
    });
  });

  it("filters invoices by status", async () => {
    render(<ClientBilling user={mockUser} />);

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
    expect(screen.getAllByText("GH₵ 1000.00").length).toBeGreaterThan(0);
  });

  it("processes payment successfully", async () => {
    // Mock pay endpoint
    global.fetch = vi.fn((url) => {
      if (
        url.includes("/client/invoices") &&
        !url.includes("pay") &&
        !url.includes("request")
      ) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve(mockInvoices),
        });
      }
      if (url.includes("/client/projects")) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => "application/json" },
          json: () => Promise.resolve(mockProjects),
        });
      }
      if (url.includes("/pay")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Success" }),
        });
      }
      return Promise.reject("Unknown URL");
    });

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
    // expect(screen.getByText("Processing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "Payment successful!",
        "success"
      );
    });
  });

  it("triggers download when Download button is clicked", async () => {
    render(<ClientBilling user={mockUser} />);

    await waitFor(() => {
      expect(
        screen.getAllByLabelText("Download invoice").length
      ).toBeGreaterThan(0);
    });

    const downloadButtons = screen.getAllByLabelText("Download invoice");
    const downloadButton = downloadButtons[0];

    fireEvent.click(downloadButton);

    expect(downloadButton).toBeDisabled();

    await waitFor(
      () => {
        expect(jsPDF).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    expect(downloadButton).not.toBeDisabled();
  });
});
