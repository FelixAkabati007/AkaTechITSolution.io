import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConnectionStatus } from "./ConnectionStatus";
import { useSyncStatus } from "@components/ui/SyncStatusProvider";

// Mock the hook
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: vi.fn(),
}));

describe("ConnectionStatus Component", () => {
  it("renders online status correctly", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "synced",
    });

    render(<ConnectionStatus />);
    const indicator = screen.getByTestId("connection-status-indicator");

    expect(indicator).toHaveAttribute("aria-label", "Online");
    // Green color for synced
    // expect(indicator).toHaveStyle({ backgroundColor: "rgb(76, 175, 80)" }); // #4CAF50
  });

  it("renders syncing status correctly", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "syncing",
    });

    render(<ConnectionStatus />);
    const indicator = screen.getByTestId("connection-status-indicator");

    expect(indicator).toHaveAttribute("aria-label", "Syncing...");
    expect(indicator).toHaveClass("animate-pulse");
    // Blue color for syncing
    // expect(indicator).toHaveStyle({ backgroundColor: "rgb(33, 150, 243)" }); // #2196F3
  });

  it("renders connecting status correctly", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "connecting",
    });

    render(<ConnectionStatus />);
    const indicator = screen.getByTestId("connection-status-indicator");

    expect(indicator).toHaveAttribute("aria-label", "Connecting...");
    expect(indicator).toHaveClass("animate-pulse");
    // Amber color for connecting
    // expect(indicator).toHaveStyle({ backgroundColor: "rgb(255, 193, 7)" }); // #FFC107
  });

  it("renders offline status correctly", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "offline",
    });

    render(<ConnectionStatus />);
    const indicator = screen.getByTestId("connection-status-indicator");

    expect(indicator).toHaveAttribute("aria-label", "Offline");
    // Red color for offline
    // expect(indicator).toHaveStyle({ backgroundColor: "rgb(244, 67, 54)" }); // #F44336
  });

  it("renders error status correctly", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "error",
    });

    render(<ConnectionStatus />);
    const indicator = screen.getByTestId("connection-status-indicator");

    expect(indicator).toHaveAttribute("aria-label", "Connection Failed");
    // expect(indicator).toHaveStyle({ backgroundColor: "rgb(244, 67, 54)" }); // #F44336
  });

  it("shows tooltip on hover", () => {
    vi.mocked(useSyncStatus).mockReturnValue({
      status: "synced",
    });

    render(<ConnectionStatus />);
    const container = screen.getByTestId("connection-status-container");

    fireEvent.mouseEnter(container);
    expect(screen.getByText("Online")).toBeInTheDocument();

    fireEvent.mouseLeave(container);
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });
});
