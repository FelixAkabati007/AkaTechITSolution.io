import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SignupWizard } from "./SignupWizard.jsx";
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: () => ({ socket: null, status: "offline" }),
}));

describe("SignupWizard offline handling", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });
  });

  it("disables Google login when offline and shows notice", () => {
    render(
      <SignupWizard
        initialPlan={{ name: "Startup Identity", price: 2500 }}
        onBack={() => {}}
        onComplete={() => {}}
      />
    );
    return screen.findByTestId("google-login").then((el) => {
      const parent = el.closest("div");
      expect(parent.className).toContain("pointer-events-none");
    });
  });
});
