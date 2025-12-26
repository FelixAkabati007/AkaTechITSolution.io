import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminSubscriptions } from "./AdminSubscriptions";
import { mockService } from "../../lib/mockData";
import { PRICING_PACKAGES } from "../../lib/data";

// Mock the dependencies
vi.mock("@lib/config", () => ({
  getApiUrl: () => "http://localhost:3000/api",
}));

vi.mock("../../lib/mockData", () => ({
  mockService: {
    getSubscriptions: vi.fn(),
    updateSubscriptionStatus: vi.fn(),
    extendSubscription: vi.fn(),
  },
}));

vi.mock("../../lib/data", () => ({
  PRICING_PACKAGES: [
    {
      name: "Enterprise Growth",
      price: "6,500",
    },
    {
      name: "Startup Identity",
      price: "2,500",
    },
  ],
}));

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Download: () => <span>Download Icon</span>,
  },
}));

describe("AdminSubscriptions", () => {
  const mockSubscriptions = [
    {
      id: 1,
      userName: "John Doe",
      userEmail: "client@gmail.com",
      plan: "Enterprise Growth",
      status: "active",
      startDate: "2023-10-15",
      endDate: "2024-10-15",
      amount: "6,500",
    },
    {
      id: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      plan: "Startup Identity",
      status: "pending",
      startDate: "2023-11-01",
      endDate: "2024-11-01",
      amount: "2,500",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getSubscriptions.mockReturnValue(mockSubscriptions);

    // Mock localStorage
    const localStorageMock = (function () {
      let store = {
        adminToken: "dummy-token",
      };
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        removeItem: function (key) {
          delete store[key];
        },
        clear: function () {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url.includes("/subscriptions?")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSubscriptions, total: 2 }),
        });
      }
      if (url.includes("/action")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  it("renders subscription list", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
    expect(screen.getByText("Subscription Management")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("displays plan details from PRICING_PACKAGES", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => {
      expect(screen.getByText("Enterprise Growth")).toBeInTheDocument();
    });
    expect(screen.getByText("GHS 6,500")).toBeInTheDocument();
  });

  it("filters subscriptions by status", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "active" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=active"),
        expect.anything()
      );
    });
  });

  it("handles approve action for pending subscription", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    const approveBtn = screen.getByText("Approve");
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/subscriptions/2/action"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "approve", details: {} }),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Subscription approved successfully")
      ).toBeInTheDocument();
    });
  });

  it("handles extend action for active subscription", async () => {
    render(<AdminSubscriptions />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const extendBtn = screen.getByText("Extend");
    fireEvent.click(extendBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/subscriptions/1/action"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "extend", details: { months: 1 } }),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Subscription extended successfully")
      ).toBeInTheDocument();
    });
  });
});
