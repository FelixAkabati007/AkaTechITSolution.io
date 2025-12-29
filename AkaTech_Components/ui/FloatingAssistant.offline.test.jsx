import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { FloatingAssistant } from "./FloatingAssistant.jsx";
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: () => ({ socket: null, status: "offline" }),
}));

describe("FloatingAssistant offline handling", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });
  });

  it("renders icon fallback when offline", () => {
    const { container } = render(<FloatingAssistant />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});
