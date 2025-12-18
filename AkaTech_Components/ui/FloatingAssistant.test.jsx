import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FloatingAssistant } from "./FloatingAssistant";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Icons
vi.mock("./Icons", () => ({
  Icons: {
    Bot: (props) => <div data-testid="icon-bot" {...props} />,
    // Mock other used icons if necessary, but component only uses Bot in fallback
    // The component also uses specific icons in the real implementation?
    // No, Icons is only used in fallback now.
  },
}));

describe("FloatingAssistant Component", () => {
  it("renders the floating button", () => {
    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );
    expect(button).toBeInTheDocument();
  });

  it("opens WhatsApp on click", () => {
    // Mock window.open
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});

    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/233244027477"),
      "_blank"
    );

    openSpy.mockRestore();
  });

  it("shows tooltip on hover", () => {
    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );

    // Simulate hover
    fireEvent.mouseEnter(button);

    expect(screen.getByText("Chat with us")).toBeInTheDocument();

    // Simulate mouse leave
    fireEvent.mouseLeave(button);

    expect(screen.queryByText("Chat with us")).not.toBeInTheDocument();
  });

  it("shows fallback icon when spline viewer fails", () => {
    const { container } = render(<FloatingAssistant />);
    const viewer = container.querySelector("spline-viewer");

    // Verify viewer is present initially
    expect(viewer).toBeInTheDocument();

    // Trigger error event
    fireEvent(viewer, new Event("error"));

    // Check if fallback icon is present
    expect(screen.getByTestId("icon-bot")).toBeInTheDocument();

    // Verify viewer is removed
    expect(container.querySelector("spline-viewer")).not.toBeInTheDocument();
  });
});
