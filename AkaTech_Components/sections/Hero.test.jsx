import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Hero } from "./Hero";

// Mock dependencies
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("../ui/Icons", () => ({
  Icons: new Proxy(
    {},
    {
      get: (_, name) => (props) =>
        <div data-testid={`icon-${name}`} {...props} />,
    }
  ),
}));

vi.mock("@lib/data", () => ({
  WEBSITE_SAMPLES: [
    { content: <div>Sample 1</div> },
    { content: <div>Sample 2</div> },
  ],
}));

describe("Hero Component", () => {
  it("renders main heading", () => {
    render(<Hero />);
    expect(screen.getByText(/Digital/i)).toBeInTheDocument();
    expect(screen.getByText(/Excellence/i)).toBeInTheDocument();
  });

  it("renders call to action buttons", () => {
    render(<Hero />);
    expect(screen.getByText("View Packages")).toBeInTheDocument();
    expect(screen.getByText("Our Work")).toBeInTheDocument();
  });

  it("renders establishment info", () => {
    render(<Hero />);
    expect(screen.getByText(/Est. 2023 \| Ghana/i)).toBeInTheDocument();
  });
});
