import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axiosInstance from "../../axiosInstance";
import { MemoryRouter, useNavigate } from "react-router-dom";
import PatientProfile from "./PatientProfile";

jest.mock("../axiosInstance");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("PatientProfile", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    localStorage.setItem("user_id", "123");
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders the form with all fields", () => {
    render(
      <MemoryRouter>
        <PatientProfile />
      </MemoryRouter>
    );

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save profile/i })
    ).toBeInTheDocument();
  });

  test("submits the form successfully", async () => {
    axiosInstance.post.mockResolvedValueOnce({ status: 200 });

    render(
      <MemoryRouter>
        <PatientProfile />
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    // Check if the form submission is successful
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/patient-profile", {
        age: "30",
        gender: "male",
        address: "123 Main St",
        user_id: 123,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("displays an error if user_id is missing in localStorage", async () => {
    localStorage.removeItem("user_id");

    render(
      <MemoryRouter>
        <PatientProfile />
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText(/user id is missing/i)).toBeInTheDocument();
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });
  });


});
