import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axiosInstance from "../../axiosInstance";
import DoctorProfile from "./DoctorProfile";
import { MemoryRouter } from "react-router-dom";

// Mock the axiosInstance for API calls
jest.mock("../../axiosInstance");

describe("DoctorProfile", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock localStorage to return a user_id
    Storage.prototype.getItem = jest.fn(() => "1");
  });

  test("renders the DoctorProfile form", () => {
    render(
      <MemoryRouter>
        <DoctorProfile />
      </MemoryRouter>
    );

    // Check that the form fields are rendered
    expect(screen.getByLabelText("Specialization")).toBeInTheDocument();
    expect(screen.getByLabelText("Experience (in years)")).toBeInTheDocument();
    expect(screen.getByLabelText("Qualification")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();

    // Check that the Save Profile button is rendered
    expect(
      screen.getByRole("button", { name: /save profile/i })
    ).toBeInTheDocument();
  });

  test("handles form submission and API call successfully", async () => {
    // Mock the POST request for submitting the doctor profile
    axiosInstance.post.mockResolvedValue({ status: 200 });

    render(
      <MemoryRouter>
        <DoctorProfile />
      </MemoryRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText("Specialization"), {
      target: { value: "Cardiologist" },
    });
    fireEvent.change(screen.getByLabelText("Experience (in years)"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Qualification"), {
      target: { value: "MD" },
    });
    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: "123 Heart Lane" },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/doctor-profile", {
        specialization: "Cardiologist",
        experience: "10",
        qualification: "MD",
        address: "123 Heart Lane",
        user_id: 1,
      });
    });

    // You can add a navigation check here if needed
  });

  test("shows error message when user ID is missing in localStorage", async () => {
    // Mock localStorage to return null (simulating missing user_id)
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <MemoryRouter>
        <DoctorProfile />
      </MemoryRouter>
    );

    // Simulate form submission
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText("User ID is missing. Please register first.")
      ).toBeInTheDocument();
    });

    // Ensure that axios is not called due to missing user_id
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });


});
