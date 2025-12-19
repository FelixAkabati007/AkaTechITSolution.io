import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FloatingAssistant } from "./FloatingAssistant";

// Mock Spline component
vi.mock("@splinetool/react-spline", () => ({
  default: ({ onLoad, onError }) => {
    React.useEffect(() => {
      // Simulate successful load
      if (onLoad) onLoad();
    }, []);
    return <div data-testid="spline-scene">Spline Scene</div>;
  },
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Bot: () => <div data-testid="bot-icon">Bot Icon</div>,
  },
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("FloatingAssistant Device Detection", () => {
  const originalInnerWidth = window.innerWidth;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    // Reset to Desktop defaults
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  it("renders Spline scene on desktop (large screen, non-mobile UA)", async () => {
    render(<FloatingAssistant />);
    // Use findBy because of Suspense/Lazy load
    const spline = await screen.findByTestId("spline-scene");
    expect(spline).toBeInTheDocument();
    expect(screen.queryByTestId("bot-icon")).not.toBeInTheDocument();
  });

  it("renders Bot icon on mobile user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)",
      configurable: true,
    });

    render(<FloatingAssistant />);
    expect(screen.getByTestId("bot-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spline-scene")).not.toBeInTheDocument();
  });

  it("renders Bot icon on Android user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36",
      configurable: true,
    });

    render(<FloatingAssistant />);
    expect(screen.getByTestId("bot-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spline-scene")).not.toBeInTheDocument();
  });

  it("renders Bot icon on small screen (< 768px)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<FloatingAssistant />);
    // Depending on implementation, we might need to trigger resize if logic is in effect
    // But since logic runs on mount, initial render with width 500 should be enough.

    expect(screen.getByTestId("bot-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spline-scene")).not.toBeInTheDocument();
  });

  it("switches dynamically when resizing", async () => {
    render(<FloatingAssistant />);

    // Initial: Desktop
    expect(await screen.findByTestId("spline-scene")).toBeInTheDocument();

    // Resize to mobile width
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByTestId("bot-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spline-scene")).not.toBeInTheDocument();

    // Resize back to desktop width
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(await screen.findByTestId("spline-scene")).toBeInTheDocument();
  });
});
