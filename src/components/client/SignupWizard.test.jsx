import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

// Mocks
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Login Mock</div>,
  useGoogleLogin: () => {},
}));

vi.mock("../ui/Icons", () => ({
  Icons: {
    Check: () => <span>Check</span>,
    AlertTriangle: () => <span>Alert</span>,
    ChevronRight: () => <span>Right</span>,
    ChevronLeft: () => <span>Left</span>,
    Loader: () => <span>Loader</span>,
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("../../lib/data", () => ({
  PRICING_PACKAGES: [
    {
      name: "Starter",
      price: 500,
      description: "Basic package",
      features: ["Feature 1", "Feature 2"],
    },
    {
      name: "Pro",
      price: 1000,
      description: "Pro package",
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
  ],
}));

describe("SignupWizard Component Integration", () => {
  it("renders successfully with data", async () => {
    // Dynamic import to avoid test environment crashes
    const { SignupWizard } = await import("./SignupWizard");
    render(<SignupWizard />);
    expect(screen.getByText("Select Your Package")).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
  });
});
