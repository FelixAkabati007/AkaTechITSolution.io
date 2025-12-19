import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { AdminSettings } from "./AdminSettings";
import { mockService } from "@lib/mockData";
import { getAuditLog } from "@lib/cookieUtils";

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    CheckCircle: () => <span>CheckCircleIcon</span>,
    Settings: () => <span>SettingsIcon</span>,
    Bell: () => <span>BellIcon</span>,
    Cookie: () => <span>CookieIcon</span>,
  },
}));

// Mock Service
vi.mock("@lib/mockData", () => ({
  mockService: {
    getSettings: vi.fn(),
    saveSettings: vi.fn(),
  },
}));

// Mock Cookie Utils
vi.mock("@lib/cookieUtils", () => ({
  getAuditLog: vi.fn(),
  clearAuditLog: vi.fn(),
}));

describe("AdminSettings", () => {
  const mockSettings = {
    siteName: "Test Site",
    emailNotifications: true,
    maintenanceMode: false,
    theme: "light",
    adminEmail: "test@example.com",
    cookiePolicyVersion: "1.0.0",
    enforceSecureCookies: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getSettings.mockReturnValue(mockSettings);
    mockService.saveSettings.mockReturnValue(mockSettings); // Reset save implementation
    getAuditLog.mockReturnValue([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with initial settings", () => {
    render(<AdminSettings />);
    expect(screen.getByDisplayValue("Test Site")).toBeDefined();
    expect(screen.getByDisplayValue("test@example.com")).toBeDefined();
  });

  it("triggers save when Save Changes button is clicked", async () => {
    render(<AdminSettings />);

    const saveButton = screen.getByText("Save Changes").closest("button");
    fireEvent.click(saveButton);

    // Expect loading state
    expect(screen.getByText("Saving...")).toBeDefined();
    expect(saveButton).toBeDisabled();

    // Fast-forward time
    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockService.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        siteName: "Test Site",
      })
    );

    // Expect success message
    expect(screen.getByText("Settings saved successfully!")).toBeDefined();
    expect(screen.getByText("Save Changes")).toBeDefined();
    expect(saveButton).not.toBeDisabled();
  });

  it("shows error message if save fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockService.saveSettings.mockImplementation(() => {
      throw new Error("Save failed");
    });

    render(<AdminSettings />);

    const saveButton = screen.getByText("Save Changes").closest("button");
    fireEvent.click(saveButton);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(
      screen.getByText("Failed to save settings. Please try again.")
    ).toBeDefined();

    consoleSpy.mockRestore();
  });

  it("updates settings state when inputs change", async () => {
    render(<AdminSettings />);

    const nameInput = screen.getByDisplayValue("Test Site");
    fireEvent.change(nameInput, { target: { value: "New Site Name" } });

    expect(screen.getByDisplayValue("New Site Name")).toBeDefined();

    const saveButton = screen.getByText("Save Changes").closest("button");
    fireEvent.click(saveButton);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockService.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        siteName: "New Site Name",
      })
    );
  });
});
