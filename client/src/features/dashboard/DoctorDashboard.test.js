import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axiosInstance from "../../axiosInstance"; // Ensure axiosInstance is imported
import DoctorDashboard from "./DoctorDashboard";

// Mock the axiosInstance
jest.mock("../axiosInstance");

// Mock the NavMain component
jest.mock("../components/NavMain", () => {
  return function DummyNavMain() {
    return <div data-testid="nav-main">NavMain</div>;
  };
});

describe("DoctorDashboard", () => {
  const mockAppointments = {
    upcoming: [
      {
        id: 1,
        patient_name: "John Doe",
        appointment_datetime: "2023-05-01T10:00:00Z",
      },
    ],
    completed: [
      {
        id: 2,
        patient_name: "Jane Smith",
        appointment_datetime: "2023-04-30T14:00:00Z",
        feedback: "Great service!",
      },
    ],
    cancelled: [
      {
        id: 3,
        patient_name: "Bob Johnson",
        appointment_datetime: "2023-05-02T11:00:00Z",
        reason: "Patient request",
      },
    ],
  };

  const mockFeedbackSummary = {
    summary: "Overall positive feedback from patients.",
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => "fake-token");

    // Mock API calls
    axiosInstance.get.mockImplementation((url) => {
      if (url === "/doctor/appointments") {
        return Promise.resolve({ data: mockAppointments });
      } else if (url === "/doctor/feedback-summary") {
        return Promise.resolve({ data: mockFeedbackSummary });
      }
      return Promise.reject(new Error("Not Found"));
    });
  });

  test("renders DoctorDashboard and fetches data", async () => {
    render(<DoctorDashboard />);

    // Check if NavMain is rendered
    expect(screen.getByTestId("nav-main")).toBeInTheDocument();

    // Wait for appointments to be loaded
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("John Doe"))
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Jane Smith"))
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Bob Johnson"))
      ).toBeInTheDocument();
    });

    // Check if feedback summary is loaded
    await waitFor(() => {
      expect(
        screen.getByText("Overall positive feedback from patients.")
      ).toBeInTheDocument();
    });
  });

  test("handles appointment cancellation", async () => {
    axiosInstance.patch.mockResolvedValue({});

    render(<DoctorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("John Doe"))
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Cancel Appointment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/appointments/1/cancel",
        {},
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
        })
      );
    });
  });

  test("handles marking appointment as completed", async () => {
    axiosInstance.patch.mockResolvedValue({});

    render(<DoctorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("John Doe"))
      ).toBeInTheDocument();
    });

    const completeButton = screen.getByText("Mark as Completed");
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/appointments/1/complete",
        {},
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
        })
      );
    });
  });

  test("handles API errors gracefully", async () => {
    // Mock the API to return errors
    axiosInstance.get.mockImplementation(() =>
      Promise.reject(new Error("API Error"))
    );

    // Mock console.error to prevent errors in the test output
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<DoctorDashboard />);

    // Check for no upcoming appointments
    await waitFor(() => {
      expect(screen.getByText("No upcoming appointments.")).toBeInTheDocument();
    });

    // Check for no completed appointments
    await waitFor(() => {
      expect(
        screen.getByText("No completed appointments.")
      ).toBeInTheDocument();
    });

    // Check for no cancelled appointments
    await waitFor(() => {
      expect(
        screen.getByText("No cancelled appointments.")
      ).toBeInTheDocument();
    });

    // Check for feedback summary error message
    await waitFor(() => {
      expect(
        screen.getByText("Unable to generate feedback summary at this time.")
      ).toBeInTheDocument();
    });

    // Verify that error logs are printed
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching appointments:",
      expect.any(Error)
    );
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching feedback summary:",
      expect.any(Error)
    );

    // Restore the original console.error behavior
    consoleErrorMock.mockRestore();
  });
});
