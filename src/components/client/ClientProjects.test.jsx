import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientProjects } from "./ClientProjects";
import { mockService } from "@lib/mockData";

// Mock the dependencies
vi.mock("@lib/mockData", () => ({
  mockService: {
    getProjects: vi.fn(),
    createTicket: vi.fn(),
  },
}));

// Mock Icons to avoid rendering issues
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Activity: () => <div data-testid="icon-activity" />,
    Clock: () => <div data-testid="icon-clock" />,
    FileText: () => <div data-testid="icon-file-text" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    Code: () => <div data-testid="icon-code" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
    Upload: () => <div data-testid="icon-upload" />,
    Download: () => <div data-testid="icon-download" />,
    X: () => <div data-testid="icon-x" />,
  },
}));

describe("ClientProjects", () => {
  const mockUser = { id: 1, name: "Test Client" };
  const mockProjects = [
    {
      id: 1,
      title: "Project Alpha",
      description: "Description Alpha",
      status: "In Progress",
      currentPhase: "Development",
      phases: [{ name: "Phase 1", status: "Completed", date: "2023-01-01" }],
      files: [],
    },
    {
      id: 2,
      title: "Project Beta",
      description: "Description Beta",
      status: "Completed",
      currentPhase: "Deployment",
      phases: [],
      files: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getProjects.mockReturnValue(mockProjects);
    // Mock window.alert
    global.alert = vi.fn();
  });

  it("renders the project list", () => {
    render(<ClientProjects user={mockUser} />);
    expect(screen.getByText("My Projects")).toBeInTheDocument();
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
  });

  it("filters projects based on search query", () => {
    render(<ClientProjects user={mockUser} />);
    const searchInput = screen.getByPlaceholderText("Search projects...");
    
    fireEvent.change(searchInput, { target: { value: "Alpha" } });
    
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Project Beta")).not.toBeInTheDocument();
  });

  it("selects a project and shows details", () => {
    render(<ClientProjects user={mockUser} />);
    
    // Click on Project Alpha
    fireEvent.click(screen.getByText("Project Alpha"));
    
    // Check if details are shown (Timeline, Deliverables headers)
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(screen.getByText("Deliverables")).toBeInTheDocument();
    expect(screen.getByText("Request Update")).toBeInTheDocument();
  });

  it("opens request update modal and sends request", () => {
    render(<ClientProjects user={mockUser} />);
    fireEvent.click(screen.getByText("Project Alpha"));
    
    // Click Request Update
    fireEvent.click(screen.getByText("Request Update"));
    
    // Check if modal opens
    expect(screen.getByText("Request Project Update")).toBeInTheDocument();
    
    // Fill form
    const messageInput = screen.getByPlaceholderText("What specific update would you like to request?");
    fireEvent.change(messageInput, { target: { value: "Need status update" } });
    
    // Submit
    fireEvent.click(screen.getByText("Send Request"));
    
    expect(mockService.createTicket).toHaveBeenCalledWith({
      clientId: mockUser.id,
      subject: "Update Request: Project Alpha",
      priority: "Normal",
      message: "Need status update",
      sender: "Client",
    });
    expect(global.alert).toHaveBeenCalledWith("Update request sent successfully!");
  });

  it("simulates file upload", async () => {
    render(<ClientProjects user={mockUser} />);
    fireEvent.click(screen.getByText("Project Alpha"));
    
    // Find hidden input
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["dummy content"], "test-file.pdf", { type: "application/pdf" });
    
    // Simulate upload
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if file appears in list
    expect(await screen.findByText("test-file.pdf")).toBeInTheDocument();
  });
});