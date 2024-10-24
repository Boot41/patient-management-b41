import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import AuthContext from "../contexts/AuthContext";
import axiosInstance from "../axiosInstance";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock axiosInstance
jest.mock("../axiosInstance");

describe("LoginPage", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the login page", () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Check if form elements are rendered
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
  });

  test("handles input changes", () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Simulate entering username
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "john_doe" },
    });
    expect(screen.getByLabelText(/Username/i).value).toBe("john_doe");

    // Simulate entering password
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    expect(screen.getByLabelText(/Password/i).value).toBe("password123");
  });

  test("handles successful login for patient", async () => {
    // Mock successful login response for a patient
    axiosInstance.post.mockResolvedValue({
      status: 200,
      data: {
        token: "fake-jwt-token",
        role: "patient",
      },
    });

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Simulate form submission
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "patient" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { token: "fake-jwt-token", role: "patient" },
        expect.any(Function)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/main");
    });
  });

  test("handles successful login for doctor", async () => {
    // Mock successful login response for a doctor
    axiosInstance.post.mockResolvedValue({
      status: 200,
      data: {
        token: "fake-jwt-token",
        role: "doctor",
      },
    });

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Simulate form submission
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "doctor" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { token: "fake-jwt-token", role: "doctor" },
        expect.any(Function)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/doctor-dashboard");
    });
  });

  test("handles failed login", async () => {
    // Mock failed login response
    axiosInstance.post.mockRejectedValue({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Simulate form submission
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "invalid_user" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong_password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
