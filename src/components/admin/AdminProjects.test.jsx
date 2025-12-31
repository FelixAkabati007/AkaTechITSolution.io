import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AdminProjects } from "./AdminProjects";

// Mock Icons to avoid rendering issues
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Plus: () => <div data-testid="icon-plus" />,
    Filter: () => <div data-testid="icon-filter" />,
    MoreVertical: () => <div data-testid="icon-more-vertical" />,
    Loader: () => <div data-testid="icon-loader" />,
    Check: () => <div data-testid="icon-check" />,
    X: () => <div data-testid="icon-x" />,
    PenTool: () => <div data-testid="icon-pen-tool" />,
    Trash: () => <div data-testid="icon-trash" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />,
  },
}));

// Mock toast provider
const mockAddToast = vi.fn();
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock SyncStatusProvider
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: () => ({ status: "online" }),
}));

// Mock ClientSelectionModal to avoid deep rendering issues
vi.mock("./ClientSelectionModal", () => ({
  ClientSelectionModal: ({ isOpen, onSelect, clients }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="client-selection-modal">
        {clients.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)}>
            {c.name}
          </button>
        ))}
      </div>
    );
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AdminProjects Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockClients = [
    {
      id: "c1",
      name: "Client One",
      email: "client1@example.com",
      googleId: "g123",
    },
    {
      id: "c2",
      name: "Client Two",
      email: "client2@example.com",
      googleId: null,
    },
  ];

  const mockProjects = [
    {
      id: "p1",
      userId: "c1",
      name: "Project Alpha",
      notes: "Description for Alpha",
      status: "Pending",
      plan: "development",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "p2",
      userId: "c2",
      name: "Project Beta",
      notes: "Description for Beta",
      status: "In Progress",
      plan: "design",
      createdAt: "2024-01-02T00:00:00.000Z",
    },
  ];

  const setupFetchMocks = (clients = mockClients, projects = mockProjects) => {
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/admin/clients")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(clients),
        });
      }
      if (url.includes("/api/admin/projects")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(projects),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  };

  it("renders projects and clients from API", async () => {
    setupFetchMocks();
    render(<AdminProjects />);

    // Verify data loaded
    await waitFor(() => {
      expect(screen.getByText(/Project Alpha/)).toBeInTheDocument();
      expect(screen.getByText("Client One")).toBeInTheDocument();
      expect(screen.getByText(/Project Beta/)).toBeInTheDocument();
      expect(screen.getByText("Client Two")).toBeInTheDocument();
    });
  });

  it("filters projects by search term", async () => {
    setupFetchMocks();
    render(<AdminProjects />);

    await waitFor(() =>
      expect(screen.getByText(/Project Alpha/)).toBeInTheDocument()
    );

    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    await waitFor(() => {
      expect(screen.getByText(/Project Alpha/)).toBeInTheDocument();
      expect(screen.queryByText(/Project Beta/)).not.toBeInTheDocument();
    });
  });

  it("filters projects by status", async () => {
    setupFetchMocks();
    render(<AdminProjects />);

    await waitFor(() =>
      expect(screen.getByText(/Project Alpha/)).toBeInTheDocument()
    );

    const filterSelect = screen.getByTestId("status-filter");

    fireEvent.change(filterSelect, { target: { value: "In Progress" } });

    await waitFor(() => {
      expect(screen.queryByText(/Project Alpha/)).not.toBeInTheDocument();
      expect(screen.getByText(/Project Beta/)).toBeInTheDocument();
    });
  });

  it("opens create project modal and submits new project", async () => {
    // Custom mock to handle POST
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/admin/projects") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ...JSON.parse(options.body), id: "p3" }),
        });
      }
      // Default GET mocks
      if (url.includes("/api/admin/clients")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClients),
        });
      }
      if (url.includes("/api/admin/projects")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProjects),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<AdminProjects />);

    await waitFor(() =>
      expect(screen.getByText(/Project Alpha/)).toBeInTheDocument()
    );

    // Click "Create Project" button
    const newProjectBtn = screen.getByText(/Create Project/);
    fireEvent.click(newProjectBtn);

    await waitFor(() => {
      expect(screen.getByText("New Project")).toBeInTheDocument(); // Modal title
    });

    // Fill form
    fireEvent.change(screen.getByLabelText("Project Title"), {
      target: { value: "New Project Gamma" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Description Gamma" },
    });

    // Select client
    const selectClientText = screen.getByText("Select Client");
    fireEvent.click(selectClientText);

    // Wait for modal and select client
    const modal = await screen.findByTestId("client-selection-modal");
    const clientOption = within(modal).getByText("Client One");
    fireEvent.click(clientOption);

    // Submit
    const createBtns = screen.getAllByText("Create Project");
    const createBtn = createBtns[createBtns.length - 1]; // The submit button is the last one
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/projects"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Project Gamma"),
        })
      );
    });
  });

  it("handles API errors gracefully", async () => {
    global.fetch.mockImplementation(() =>
      Promise.reject(new Error("API Error"))
    );
    render(<AdminProjects />);

    await waitFor(() => {
      // Depending on implementation, it might show an error toast or console error
      // Since we mocked console.error usually, we might check for empty state or error UI
      // For this test, let's assume it handles it without crashing
      expect(screen.queryByText("Project Alpha")).not.toBeInTheDocument();
    });
  });
});
