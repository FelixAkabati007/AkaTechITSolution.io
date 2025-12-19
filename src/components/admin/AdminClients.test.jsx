import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminClients } from "./AdminClients";
import { mockService } from "@lib/mockData";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Plus: () => <span>PlusIcon</span>,
    PenTool: () => <span>PenToolIcon</span>,
    Trash: () => <span>TrashIcon</span>,
  },
}));

// Mock Service
vi.mock("@lib/mockData", () => ({
  mockService: {
    getUsers: vi.fn(),
    saveUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

describe("AdminClients", () => {
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "client",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "project_manager",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getUsers.mockReturnValue(mockUsers);
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  it("renders the user list", () => {
    render(<AdminClients />);
    expect(screen.getByText("User Management")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("Jane Smith")).toBeDefined();
  });

  it("opens modal in edit mode when Edit button is clicked", () => {
    render(<AdminClients />);
    
    // Find edit buttons (PenToolIcon)
    const editButtons = screen.getAllByLabelText("Edit user");
    fireEvent.click(editButtons[0]); // Click edit for John Doe

    // Modal should open with "Edit User" title
    expect(screen.getByText("Edit User")).toBeDefined();
    
    // Form fields should be pre-filled
    expect(screen.getByLabelText("Full Name").value).toBe("John Doe");
    expect(screen.getByLabelText("Email").value).toBe("john@example.com");
    expect(screen.getByLabelText("Role").value).toBe("client");
    
    // Submit button should say "Update User"
    expect(screen.getByText("Update User")).toBeDefined();
  });

  it("calls updateUser when form is submitted in edit mode", () => {
    render(<AdminClients />);
    
    // Open edit modal for first user
    const editButtons = screen.getAllByLabelText("Edit user");
    fireEvent.click(editButtons[0]);

    // Change name
    const nameInput = screen.getByLabelText("Full Name");
    fireEvent.change(nameInput, { target: { value: "John Doe Updated" } });

    // Submit form
    const form = screen.getByLabelText("edit-user-form");
    fireEvent.submit(form);

    // Verify updateUser was called with updated data
    expect(mockService.updateUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      name: "John Doe Updated",
      email: "john@example.com",
      role: "client",
    }));

    // Verify modal closed (or at least list refreshed)
    expect(mockService.getUsers).toHaveBeenCalledTimes(2); // Initial render + after update
  });

  it("calls deleteUser when Delete button is clicked and confirmed", () => {
    render(<AdminClients />);
    
    // Find delete buttons
    const deleteButtons = screen.getAllByLabelText("Delete user");
    fireEvent.click(deleteButtons[0]); // Delete John Doe

    expect(global.confirm).toHaveBeenCalledWith("Are you sure you want to delete this user?");
    expect(mockService.deleteUser).toHaveBeenCalledWith(1);
    expect(mockService.getUsers).toHaveBeenCalledTimes(2); // Initial render + after delete
  });

  it("does not delete if confirm is cancelled", () => {
    global.confirm.mockReturnValue(false);
    render(<AdminClients />);
    
    const deleteButtons = screen.getAllByLabelText("Delete user");
    fireEvent.click(deleteButtons[0]);

    expect(mockService.deleteUser).not.toHaveBeenCalled();
  });
});
