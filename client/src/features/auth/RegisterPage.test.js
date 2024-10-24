import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axiosInstance from "../../axiosInstance";
import { MemoryRouter, useNavigate } from "react-router-dom";
import RegisterPage from "./RegisterPage";

jest.mock("../axiosInstance");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("RegisterPage", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders the form with all fields", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("submits the form successfully and redirects to patient profile", async () => {
    // Mock successful registration response
    axiosInstance.post.mockResolvedValueOnce({
      status: 200,
      data: { id: 123 },
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "patient" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Check if the form submission is successful
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/register", {
        username: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "patient",
      });
      expect(localStorage.getItem("user_id")).toBe("123");
      expect(mockNavigate).toHaveBeenCalledWith("/patient-profile");
    });
  });

  test("submits the form successfully and redirects to doctor profile", async () => {
    // Mock successful registration response
    axiosInstance.post.mockResolvedValueOnce({
      status: 200,
      data: { id: 456 },
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "doctor" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Check if the form submission is successful
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/register", {
        username: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        role: "doctor",
      });
      expect(localStorage.getItem("user_id")).toBe("456");
      expect(mockNavigate).toHaveBeenCalledWith("/doctor-profile");
    });
  });

 
});
