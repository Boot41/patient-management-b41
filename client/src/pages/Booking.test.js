import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { act } from "react";
import BookingPage from "./Booking";
import axiosInstance from "../axiosInstance";

// Mock the axiosInstance
jest.mock("../axiosInstance");

// Mock the NavMain component
jest.mock("../components/NavMain", () => () => (
  <div data-testid="nav-main">Nav Main</div>
));

const mockNavigate = jest.fn();

// Mock the react-router-dom hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useNavigate: () => mockNavigate,
}));

describe("BookingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the booking page and fetches doctor data", async () => {
    const mockDoctor = {
      username: "John Doe",
      specialization: "Cardiology",
      experience: 10,
      address: "123 Main St",
    };

    axiosInstance.get.mockResolvedValueOnce({ data: mockDoctor });
    axiosInstance.get.mockResolvedValueOnce({ data: [] }); // Empty feedbacks

    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<BookingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId("nav-main")).toBeInTheDocument();
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(screen.getByText("Specialization: Cardiology")).toBeInTheDocument();
    expect(screen.getByText("Experience: 10 years")).toBeInTheDocument();
    expect(screen.getByText("Address: 123 Main St")).toBeInTheDocument();
    expect(
      screen.getByText("No feedback available for this doctor.")
    ).toBeInTheDocument();
  });

  it("allows user to fill and submit the booking form", async () => {
    const mockDoctor = { username: "John Doe" };
    axiosInstance.get.mockResolvedValue({ data: mockDoctor });
    axiosInstance.post.mockResolvedValue({
      data: { message: "Appointment booked successfully" },
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<BookingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByLabelText("Appointment Date"), {
      target: { value: "2023-06-01" },
    });
    fireEvent.change(screen.getByLabelText("Appointment Time"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Reason for Appointment"), {
      target: { value: "Annual checkup" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Confirm Appointment"));
    });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/appointment",
        expect.objectContaining({
          doctor_id: "123",
          appointment_datetime: expect.any(String),
          reason: "Annual checkup",
        }),
        expect.any(Object)
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/patient-dashboard");
  });

  it("displays error message when booking fails", async () => {
    const mockDoctor = { username: "John Doe" };
    axiosInstance.get.mockResolvedValue({ data: mockDoctor });
    axiosInstance.post.mockRejectedValue(new Error("Booking failed"));

    console.error = jest.fn(); // Mock console.error to prevent it from cluttering the test output

    await act(async () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<BookingPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByLabelText("Appointment Date"), {
      target: { value: "2023-06-01" },
    });
    fireEvent.change(screen.getByLabelText("Appointment Time"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Reason for Appointment"), {
      target: { value: "Annual checkup" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Confirm Appointment"));
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error booking appointment:",
      expect.any(Error)
    );
  });
});
