import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Contact } from "./Contact";
import { ToastProvider } from "../ui/ToastProvider";

// Mock dependencies
vi.mock("../ui/Icons", () => ({
  Icons: {
    Check: () => <span>Check Icon</span>,
    Success: () => <span>Success Icon</span>,
    Info: () => <span>Info Icon</span>,
    X: () => <span>X Icon</span>,
    Loader: () => <span>Loader Icon</span>, // Assuming Loader is used
    Send: () => <span>Send Icon</span>, // Assuming Send is used
  },
}));

// Wrap component with providers
const renderWithProviders = (component) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("Contact Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renders the contact form", () => {
    renderWithProviders(<Contact />);
    expect(screen.getByPlaceholderText("NAME")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("EMAIL")).toBeInTheDocument();
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    renderWithProviders(<Contact />);

    const submitBtn = screen.getByText("Send Message");
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Subject is required")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    renderWithProviders(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("EMAIL"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByText("Send Message"));

    expect(await screen.findByText("Email is invalid")).toBeInTheDocument();
  });

  it("filters profanity", async () => {
    renderWithProviders(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("NAME"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("EMAIL"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("SUBJECT"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByPlaceholderText("MESSAGE"), {
      target: { value: "This is spam and junk" },
    });

    fireEvent.click(screen.getByText("Send Message"));

    expect(
      await screen.findByText("Message contains inappropriate content")
    ).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    renderWithProviders(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("NAME"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("EMAIL"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("SUBJECT"), {
      target: { value: "Inquiry" },
    });
    fireEvent.change(screen.getByPlaceholderText("MESSAGE"), {
      target: { value: "Hello, I would like to inquire about your services." },
    });

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(screen.getByText("Message Sent")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/client-messages"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          subject: "Inquiry",
          message: "Hello, I would like to inquire about your services.",
        }),
      })
    );
  });

  it("handles API errors", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    renderWithProviders(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("NAME"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("EMAIL"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("SUBJECT"), {
      target: { value: "Inquiry" },
    });
    fireEvent.change(screen.getByPlaceholderText("MESSAGE"), {
      target: { value: "Hello." },
    });

    fireEvent.click(screen.getByText("Send Message"));

    // Should find at least one error message (Toast or inline)
    const errorMessages = await screen.findAllByText("Server error");
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
