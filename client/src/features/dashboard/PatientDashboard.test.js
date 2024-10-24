import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // No need for /extend-expect
import axiosInstance from "../../axiosInstance";
import PatientDashboard from "./PatientDashboard";
import { MemoryRouter } from "react-router-dom"; // Using MemoryRouter to wrap the component

jest.mock("../axiosInstance");

describe("PatientDashboard", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders PatientDashboard component", () => {
    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText("Patient Dashboard")).toBeInTheDocument();
  });

  test("fetches and displays appointments", async () => {
    const mockData = {
      data: {
        upcoming: [
          {
            id: 1,
            doctor_name: "Smith",
            appointment_datetime: "2023-10-10T10:00:00Z",
          },
        ],
        past: [
          {
            id: 2,
            doctor_name: "Doe",
            appointment_datetime: "2023-09-10T10:00:00Z",
          },
        ],
        cancelled: [
          {
            id: 3,
            doctor_name: "Brown",
            appointment_datetime: "2023-08-10T10:00:00Z",
            reason: "Personal",
          },
        ],
      },
    };

    axiosInstance.get.mockResolvedValueOnce(mockData);

    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Dr. Doe")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Dr. Brown")).toBeInTheDocument();
    });
  });



  test("submits feedback for an appointment", async () => {
    const mockData = {
      data: {
        upcoming: [],
        past: [
          {
            id: 2,
            doctor_name: "Doe",
            appointment_datetime: "2023-09-10T10:00:00Z",
          },
        ],
        cancelled: [],
      },
    };

    axiosInstance.get.mockResolvedValueOnce(mockData);
    axiosInstance.put.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dr. Doe")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your feedback..."), {
      target: { value: "Great service!" },
    });

    fireEvent.click(screen.getByText("Submit Feedback"));

    await waitFor(() => {
      expect(
        screen.getByText('Feedback: "Great service!"')
      ).toBeInTheDocument();
    });
  });
});
