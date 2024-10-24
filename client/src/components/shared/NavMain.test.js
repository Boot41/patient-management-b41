import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import NavMain from "./NavMain";

// Mock the useNavigate function from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("NavMain Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "role") {
        return "patient";
      }
      return null;
    });

    // Mock the navigate function
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders navigation bar with 'Patient Appointment System' title and buttons", () => {
    render(
      <Router>
        <NavMain />
      </Router>
    );

    // Check if the title is rendered
    expect(screen.getByText("Patient Appointment System")).toBeInTheDocument();

    // Check if the 'Dashboard' button is rendered (since the role is "patient")
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Check if the 'Logout' button is rendered
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("navigates to home page when title is clicked", () => {
    render(
      <Router>
        <NavMain />
      </Router>
    );

    // Simulate a click on the title
    fireEvent.click(screen.getByText("Patient Appointment System"));

    // Check if navigate was called with the home path "/"
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to patient dashboard when 'Dashboard' button is clicked (role: patient)", () => {
    render(
      <Router>
        <NavMain />
      </Router>
    );

    // Simulate a click on the 'Dashboard' button
    fireEvent.click(screen.getByText("Dashboard"));

    // Check if navigate was called with the patient dashboard path
    expect(mockNavigate).toHaveBeenCalledWith("/patient-dashboard");
  });



  test("does not render the dashboard button for doctors (role: doctor)", () => {
    // Mock localStorage to return "doctor" for the role
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "role") {
        return "doctor";
      }
      return null;
    });

    render(
      <Router>
        <NavMain />
      </Router>
    );

    // Check that the 'Dashboard' button is not rendered for doctors
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
