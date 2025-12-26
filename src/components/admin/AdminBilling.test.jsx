import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminBilling } from "./AdminBilling";
import { mockService } from "@lib/mockData";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>PlusIcon</span>,
    Download: () => <span>DownloadIcon</span>,
    Edit: () => <span>EditIcon</span>,
    Trash: () => <span>TrashIcon</span>,
  },
}));

// Mock config
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://test-api.com",
  getSocketUrl: () => "http://test-socket.com",
}));

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock ToastProvider
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// Mock jspdf
vi.mock("jspdf", () => ({
  jsPDF: vi.fn(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
    addImage: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock Service
vi.mock("@lib/mockData", () => ({
  mockService: {
    getInvoices: vi.fn(),
    getProjects: vi.fn(),
    saveInvoice: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

describe("AdminBilling", () => {
  const mockProjects = [
    { id: 1, title: "E-Commerce Website Redesign" },
    { id: 2, title: "Mobile App Development" },
    { id: 3, title: "Inventory Management System" },
    { id: 4, title: "HR & Payroll System" },
    { id: 5, title: "CRM Integration" },
  ];

  const mockInvoices = [
    {
      id: "INV-001",
      projectId: 1,
      amount: 5000,
      status: "Paid",
      date: "2023-10-15",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getInvoices.mockReturnValue(mockInvoices);
    mockService.getProjects.mockReturnValue(mockProjects);
  });

  it("renders the project select with new BMS options", () => {
    render(<AdminBilling />);

    // Open the modal
    const createButton = screen.getByText("Create Invoice").closest("button");
    fireEvent.click(createButton);

    // Check if select exists
    const select = screen.getByLabelText("Project");
    expect(select).toBeDefined();

    // Check for new options
    expect(screen.getByText("Inventory Management System")).toBeDefined();
    expect(screen.getByText("HR & Payroll System")).toBeDefined();
    expect(screen.getByText("CRM Integration")).toBeDefined();
  });
});
