import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { About } from "./About";
import { PORTFOLIO_DATA } from "../lib/data";
import { mockService } from "../lib/mockData";

// Mock mockData
vi.mock("../lib/mockData", () => ({
  mockService: {
    getSubscriptions: vi.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock the Icons component
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Users: () => <span data-testid="icon-users" />,
    Mail: () => <span data-testid="icon-mail" />,
    Smartphone: () => <span data-testid="icon-smartphone" />,
    Lock: () => <span data-testid="icon-lock" />,
  },
}));

describe("About Page", () => {
  beforeEach(() => {
    mockService.getSubscriptions.mockReturnValue([]);
  });

  it("renders the profile header with correct information", () => {
    render(<About />);

    // Check Name
    expect(screen.getByText(PORTFOLIO_DATA.profile.name)).toBeInTheDocument();

    // Check Title
    expect(screen.getByText(PORTFOLIO_DATA.profile.title)).toBeInTheDocument();

    // Check Bio (using a substring matcher because it might be long or have line breaks)
    expect(
      screen.getByText((content) =>
        content.includes("Experienced Full Stack Developer")
      )
    ).toBeInTheDocument();

    // Check Contact Button
    expect(screen.getByText("Contact Me")).toBeInTheDocument();
  });

  it("renders contact information", () => {
    render(<About />);

    expect(
      screen.getByText(PORTFOLIO_DATA.profile.location)
    ).toBeInTheDocument();
    expect(screen.getByText(PORTFOLIO_DATA.profile.email)).toBeInTheDocument();
    expect(screen.getByText(PORTFOLIO_DATA.profile.phone)).toBeInTheDocument();
  });

  it("renders technical skills section", () => {
    render(<About />);

    expect(screen.getByText("Technical Skills")).toBeInTheDocument();

    // Check for a few skills to ensure mapping works
    PORTFOLIO_DATA.skills.forEach((group) => {
      expect(screen.getByText(group.category)).toBeInTheDocument();
      group.items.slice(0, 2).forEach((item) => {
        // Check first 2 items of each group
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });
  });

  it("renders featured projects section", () => {
    render(<About />);

    expect(screen.getByText("Featured Projects")).toBeInTheDocument();

    PORTFOLIO_DATA.projects.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument();
    });
  });

  it("toggles project lock state on button click", () => {
    render(<About />);

    const viewButtons = screen.getAllByText(/View Project/i);
    const firstButton = viewButtons[0];

    // Initial state: "View Project"
    expect(firstButton).toBeInTheDocument();

    // Click to toggle
    fireEvent.click(firstButton);

    // Expect text to change to "Locked"
    expect(screen.getByText(/Locked/i)).toBeInTheDocument();

    // Click again to toggle back (finding by the new text)
    const lockedButton = screen.getByText(/Locked/i);
    fireEvent.click(lockedButton);

    // Expect text to change back to "View Project"
    expect(screen.getAllByText(/View Project/i)[0]).toBeInTheDocument();
  });

  it("renders experience and education sections", () => {
    render(<About />);

    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();

    PORTFOLIO_DATA.experience.forEach((exp) => {
      expect(screen.getByText(exp.role)).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes(exp.company))
      ).toBeInTheDocument();
    });

    PORTFOLIO_DATA.education.forEach((edu) => {
      expect(screen.getByText(edu.degree)).toBeInTheDocument();
      expect(screen.getByText(edu.school)).toBeInTheDocument();
      // If mockService is mocked to return empty, it should show original period
      if (edu.period !== "2023") {
        expect(screen.getByText(edu.period)).toBeInTheDocument();
      }
    });
  });

  it('updates period to "Present" when subscription is active', () => {
    mockService.getSubscriptions.mockReturnValue([{ status: "active" }]);
    render(<About />);

    // Find the education item container
    // "B.Ed. Information Technology" is the degree
    const degreeElement = screen.getByText("B.Ed. Information Technology");
    const educationItem = degreeElement.closest("div").parentElement;

    // Check if "Present" is inside it
    expect(educationItem).toHaveTextContent("Present");
  });

  it("shows original period when subscription is not active", () => {
    mockService.getSubscriptions.mockReturnValue([{ status: "expired" }]);
    render(<About />);

    const degreeElement = screen.getByText("B.Ed. Information Technology");
    const educationItem = degreeElement.closest("div").parentElement;

    expect(educationItem).toHaveTextContent("2023");
  });

  it("updates in real-time when subscriptionUpdated event fires", () => {
    mockService.getSubscriptions.mockReturnValue([]);
    render(<About />);

    const degreeElement = screen.getByText("B.Ed. Information Technology");
    const educationItem = degreeElement.closest("div").parentElement;
    expect(educationItem).toHaveTextContent("2023");

    // Simulate update
    mockService.getSubscriptions.mockReturnValue([{ status: "active" }]);

    act(() => {
      window.dispatchEvent(new Event("subscriptionUpdated"));
    });

    expect(educationItem).toHaveTextContent("Present");
  });

  it("handles sync errors gracefully", () => {
    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockService.getSubscriptions.mockImplementation(() => {
      throw new Error("Sync failed");
    });

    render(<About />);

    const degreeElement = screen.getByText("B.Ed. Information Technology");
    const educationItem = degreeElement.closest("div").parentElement;

    // Should fallback to original period on error
    expect(educationItem).toHaveTextContent("2023");

    consoleSpy.mockRestore();
  });
});
