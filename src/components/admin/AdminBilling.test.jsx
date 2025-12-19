import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminBilling } from "./AdminBilling";
import { mockService } from "@lib/mockData";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>PlusIcon</span>,
    Download: () => <span>DownloadIcon</span>,
  },
}));

// Mock Service
vi.mock("@lib/mockData", () => ({
  mockService: {
    getInvoices: vi.fn(),
    getProjects: vi.fn(),
    saveInvoice: vi.fn(),
  },
}));

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
