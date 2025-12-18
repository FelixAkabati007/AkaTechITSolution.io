import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Recommendations } from "./Recommendations";

// Mock data
vi.mock("@lib/data", () => ({
  RECOMMENDATIONS: [
    {
      name: "With Image",
      role: "CEO",
      text: "Text 1",
      image: "https://example.com/image.jpg",
    },
    {
      name: "No Image",
      role: "CTO",
      text: "Text 2",
    },
  ],
}));

// Mock icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Quote: (props) => <div data-testid="icon-quote" {...props} />,
  },
}));

describe("Recommendations Component", () => {
  it("renders recommendations", () => {
    render(<Recommendations />);
    expect(screen.getByText("With Image")).toBeInTheDocument();
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("renders image for recommendation with image", () => {
    render(<Recommendations />);
    const img = screen.getByRole("img", { name: "With Image" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders initial for recommendation without image", () => {
    render(<Recommendations />);
    expect(screen.getByText("N")).toBeInTheDocument(); // First letter of "No Image"
  });
});
