import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Footer } from "./Footer";

// Mock Icons to avoid Lucide import issues in tests if any
vi.mock("../ui/Icons", () => ({
  Icons: {
    Facebook: () => <span data-testid="icon-facebook">Facebook</span>,
    Twitter: () => <span data-testid="icon-twitter">Twitter</span>,
    Instagram: () => <span data-testid="icon-instagram">Instagram</span>,
    Linkedin: () => <span data-testid="icon-linkedin">Linkedin</span>,
    Menu: () => <span>Menu</span>, // Mock other icons if needed
  },
  Logo: () => <span>Logo</span>,
}));

// Mock Logo separately since it's imported from Logo.jsx
vi.mock("../ui/Logo", () => ({
  Logo: () => <span data-testid="logo">Logo</span>,
}));

describe("Footer Component", () => {
  const mockOnNavigate = vi.fn();

  it("renders Quick Links section correctly", () => {
    render(<Footer onNavigate={mockOnNavigate} />);

    // Check header
    expect(screen.getByText("Quick Links")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Help & Support")).toBeInTheDocument();
    expect(screen.getByText("Connect with Us")).toBeInTheDocument();
  });

  it("navigates correctly when links are clicked", () => {
    render(<Footer onNavigate={mockOnNavigate} />);

    // Click Home
    fireEvent.click(screen.getByText("Home"));
    expect(mockOnNavigate).toHaveBeenCalledWith("landing");

    // Click Help & Support
    fireEvent.click(screen.getByText("Help & Support"));
    expect(mockOnNavigate).toHaveBeenCalledWith("contact");

    // Click Web Development (Service)
    fireEvent.click(screen.getByText("Web Development"));
    expect(mockOnNavigate).toHaveBeenCalledWith("landing");
  });

  it("renders social media icons", () => {
    render(<Footer onNavigate={mockOnNavigate} />);

    expect(screen.getByTestId("icon-facebook")).toBeInTheDocument();
    expect(screen.getByTestId("icon-twitter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-instagram")).toBeInTheDocument();
    expect(screen.getByTestId("icon-linkedin")).toBeInTheDocument();
  });
});
