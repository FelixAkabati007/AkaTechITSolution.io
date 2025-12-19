import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientSupport } from "./ClientSupport";
import { mockService } from "@lib/mockData";

// Mock dependencies
vi.mock("@lib/mockData", () => ({
  mockService: {
    getTickets: vi.fn(),
    saveTicket: vi.fn(),
  },
}));

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <div data-testid="icon-plus" />,
    LifeBuoy: () => <div data-testid="icon-life-buoy" />,
    X: () => <div data-testid="icon-x" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
    Send: () => <div data-testid="icon-send" />,
  },
}));

describe("ClientSupport", () => {
  const mockUser = { id: 1, name: "Test Client" };
  const mockTickets = [
    {
      id: 101,
      subject: "Login Issue",
      priority: "High",
      status: "Open",
      message: "Cannot login",
      createdAt: "2023-01-01",
      replies: [],
    },
    {
      id: 102,
      subject: "Feature Request",
      priority: "Low",
      status: "Closed",
      message: "Add dark mode",
      createdAt: "2023-01-02",
      replies: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getTickets.mockReturnValue(mockTickets);
  });

  it("renders the ticket list", () => {
    render(<ClientSupport user={mockUser} />);
    expect(screen.getByText("Support Tickets")).toBeInTheDocument();
    expect(screen.getByText("Login Issue")).toBeInTheDocument();
    expect(screen.getByText("Feature Request")).toBeInTheDocument();
  });

  it("selects a ticket and shows details", () => {
    render(<ClientSupport user={mockUser} />);

    // Initial state: no selection placeholder
    expect(
      screen.getByText("Select a ticket to view conversation")
    ).toBeInTheDocument();

    // Click ticket
    fireEvent.click(screen.getByText("Login Issue"));

    // Check details
    expect(
      screen.queryByText("Select a ticket to view conversation")
    ).not.toBeInTheDocument();
    // Use getAllByText because the text exists in the list item and the detail view
    expect(screen.getAllByText("Cannot login").length).toBeGreaterThan(0);
    expect(
      screen.getByPlaceholderText("Type your reply...")
    ).toBeInTheDocument();
  });

  it("sends a reply", () => {
    render(<ClientSupport user={mockUser} />);
    fireEvent.click(screen.getByText("Login Issue"));

    const replyInput = screen.getByPlaceholderText("Type your reply...");
    fireEvent.change(replyInput, { target: { value: "Fixed it myself" } });

    fireEvent.click(screen.getByTestId("icon-send").parentElement);

    // Should show the new reply
    expect(screen.getByText("Fixed it myself")).toBeInTheDocument();
  });

  it("opens create ticket modal and submits", () => {
    render(<ClientSupport user={mockUser} />);

    fireEvent.click(screen.getByText("New Ticket"));

    expect(screen.getByText("Create New Ticket")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Brief summary of the issue"),
      {
        target: { value: "New Bug" },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Describe your issue in detail..."),
      {
        target: { value: "Something broke" },
      }
    );

    fireEvent.click(screen.getByText("Submit Ticket"));

    expect(mockService.saveTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: mockUser.id,
        subject: "New Bug",
        message: "Something broke",
        status: "Open",
      })
    );
  });
});
