import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock Toast
const mockAddToast = vi.fn();
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock Fetch
global.fetch = vi.fn();

describe("AdminClients", () => {
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "client",
      accountType: "email",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "project_manager",
      accountType: "google",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getUsers.mockReturnValue(mockUsers);
    global.confirm = vi.fn(() => true);

    // Default fetch mock to return users
    global.fetch.mockImplementation((url) => {
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("renders the user list from API", async () => {
    render(<AdminClients />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeDefined();
      expect(screen.getByText("Jane Smith")).toBeDefined();
    });

    expect(screen.getByText("User Management")).toBeDefined();
  });

  it("opens modal", async () => {
    render(<AdminClients />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeDefined();
    });

    const addButton = screen.getByText("Add User");
    fireEvent.click(addButton);

    expect(screen.getByText("Create User")).toBeDefined();
  });

  it("calls API when form is submitted for manual registration", async () => {
    render(<AdminClients />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Add User"));

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    // Mock register API response
    global.fetch.mockImplementation((url) => {
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers),
        });
      }
      if (url.includes("/auth/register")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 3, name: "New User" } }),
        });
      }
    });

    const form = screen.getByLabelText("add-user-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "New User",
            email: "new@example.com",
            password: "password123",
            role: "client",
            accountType: "manual",
          }),
        })
      );
      expect(mockAddToast).toHaveBeenCalledWith(
        "User registered successfully!",
        "success"
      );
    });
  });
});
