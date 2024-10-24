import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AuthContext from "../contexts/AuthContext";

// Mock components for navigation testing
const MockLogin = () => <div>Login Page</div>;
const MockUnauthorized = () => <div>Unauthorized Page</div>;
const MockProtectedComponent = () => <div>Protected Component</div>;

describe("PrivateRoute Component", () => {
  const renderWithAuthContext = (user, allowedRoles, element) => {
    return render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route
              path="/protected"
              element={
                <PrivateRoute element={element} allowedRoles={allowedRoles} />
              }
            />
            <Route path="/login" element={<MockLogin />} />
            <Route path="/unauthorized" element={<MockUnauthorized />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  test("redirects to login if user is not authenticated", () => {
    renderWithAuthContext(
      null,
      ["patient", "doctor"],
      <MockProtectedComponent />
    );

    // Check that the user is redirected to the login page
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects to unauthorized page if user is not authorized", () => {
    const mockUser = { role: "patient" }; // User with 'patient' role
    renderWithAuthContext(mockUser, ["doctor"], <MockProtectedComponent />);

    // Check that the user is redirected to the unauthorized page
    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
  });

  test("renders the protected element if the user is authorized", () => {
    const mockUser = { role: "patient" }; // User with 'patient' role
    renderWithAuthContext(
      mockUser,
      ["patient", "doctor"],
      <MockProtectedComponent />
    );

    // Check that the protected component is rendered
    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });

  test("renders the protected element if no allowedRoles are provided", () => {
    const mockUser = { role: "patient" }; // User with 'patient' role
    renderWithAuthContext(mockUser, null, <MockProtectedComponent />);

    // Check that the protected component is rendered
    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });
});
