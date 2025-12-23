import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "./Navbar";

// Mock dependencies
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Sun: () => <div data-testid="icon-sun">Sun</div>,
    Moon: () => <div data-testid="icon-moon">Moon</div>,
    Monitor: () => <div data-testid="icon-monitor">Monitor</div>,
    Menu: () => <div data-testid="icon-menu">Menu</div>,
    X: () => <div data-testid="icon-x">X</div>,
  },
}));

vi.mock("@components/ui/Logo", () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("@components/ui/SearchButton", () => ({
  SearchButton: () => <div data-testid="search-button">Search</div>,
}));

vi.mock("@components/ui/Button", () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("Navbar Component", () => {
  const defaultProps = {
    toggleAuth: vi.fn(),
    isLoggedIn: false,
    user: null,
    mode: "system",
    cycleTheme: vi.fn(),
    onViewChange: vi.fn(),
  };

  it("renders correctly", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("AKATECH")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("displays login button when not logged in", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText("Client Login")).toBeInTheDocument();
  });

  it("displays user initial when logged in", () => {
    const userProps = {
      ...defaultProps,
      isLoggedIn: true,
      user: { name: "Test User", avatar: "avatar.jpg" },
    };
    render(<Navbar {...userProps} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("calls toggleAuth when login button is clicked", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByText("Client Login"));
    expect(defaultProps.toggleAuth).toHaveBeenCalled();
  });

  it("navigates to About page when About button is clicked", () => {
    render(<Navbar {...defaultProps} />);
    const aboutButton = screen.getByText("About");
    fireEvent.click(aboutButton);
    expect(defaultProps.onViewChange).toHaveBeenCalledWith("about");
  });
});
