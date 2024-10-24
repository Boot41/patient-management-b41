import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "./LandingPage";

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LandingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the landing page with all sections", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Navbar
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // Hero Section
    expect(
      screen.getByRole("heading", {
        name: /Connecting You to Your Healthcare Needs/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Discover the best doctors, clinics & hospitals near you./i
      )
    ).toBeInTheDocument();

    // Services Section
    expect(
      screen.getByRole("heading", { name: /Our Services/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Doctor Consultations/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Support/i)).toBeInTheDocument();

    // Use getAllByText for "Medical Records" to avoid conflicts
    const medicalRecordsElements = screen.getAllByText(/Medical Records/i);
    expect(medicalRecordsElements.length).toBeGreaterThan(0);

    // Testimonials Section
    expect(
      screen.getByRole("heading", { name: /What Our Patients Say/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The platform made it so easy to find a doctor and schedule an appointment. Highly recommended!/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Thanks to this service, I was able to receive the care I needed quickly and efficiently. Great experience!/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The doctors here are top-notch and the platform is extremely user-friendly. I couldn't ask for a better experience!/i
      )
    ).toBeInTheDocument();

    // About Us Section
    expect(
      screen.getByRole("heading", { name: /About Us/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We are dedicated to connecting you with the best healthcare providers./i
      )
    ).toBeInTheDocument();

    // Footer Section
    expect(
      screen.getByText(/© 2024 Your Healthcare Platform. All rights reserved./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test("navigates to login page when 'Book Now' button is clicked", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const bookNowButton = screen.getByRole("button", { name: /book now/i });
    fireEvent.click(bookNowButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
