import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SearchButton } from "./SearchButton";

// Mock dependencies
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  Search: (props) => <div data-testid="icon-search" {...props} />,
  Loader: (props) => <div data-testid="icon-loader" {...props} />,
  X: (props) => <div data-testid="icon-x" {...props} />,
  AlertCircle: (props) => <div data-testid="icon-alert" {...props} />,
  History: (props) => <div data-testid="icon-history" {...props} />,
}));

// Mock useDebounce to return value immediately for testing
vi.mock("@hooks/useDebounce", () => ({
  useDebounce: (val) => val,
}));

describe("SearchButton Component", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("renders search icon initially", () => {
    render(<SearchButton />);
    expect(screen.getByLabelText("Open search")).toBeInTheDocument();
  });

  it("expands on click", () => {
    render(<SearchButton />);
    const button = screen.getByLabelText("Open search");
    fireEvent.click(button);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("validates input length on submit", async () => {
    render(<SearchButton minChars={3} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.submit(screen.getByRole("search")); // Submit form

    expect(
      await screen.findByText(/at least 3 characters/i)
    ).toBeInTheDocument();
  });

  it("calls onSearch when valid and submitted manually", async () => {
    const handleSearch = vi.fn().mockResolvedValue(true);
    render(<SearchButton onSearch={handleSearch} autoSearch={false} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: "test query" } });
    fireEvent.submit(screen.getByRole("search"));

    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalledWith("test query");
    });
  });

  it("shows recent searches", async () => {
    const handleSearch = vi.fn().mockResolvedValue(true);
    render(<SearchButton onSearch={handleSearch} autoSearch={false} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    const input = screen.getByPlaceholderText(/search/i);

    // Perform a search to add to history
    fireEvent.change(input, { target: { value: "history item" } });
    fireEvent.submit(screen.getByRole("search"));

    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalled();
    });

    // Wait for search to finish (loader to disappear)
    await waitFor(() => {
      expect(screen.queryByTestId("icon-loader")).not.toBeInTheDocument();
    });

    // Clear input to show history
    fireEvent.change(input, { target: { value: "" } });

    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("history item")).toBeInTheDocument();
  });
});
