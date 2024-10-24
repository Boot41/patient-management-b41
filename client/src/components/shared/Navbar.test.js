import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
  const renderNavbar = () =>
    render(
      <Router>
        <Navbar />
      </Router>
    );

  test("renders Navbar with 'HealthConnect' logo and links", () => {
    renderNavbar();

    // Check if the logo is rendered
    expect(screen.getByText("HealthConnect")).toBeInTheDocument();

    // Check if 'Login' and 'Register' links are rendered in desktop view
    const desktopLinks = screen.getAllByText("Login");
    expect(desktopLinks[0]).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("does not display mobile menu initially", () => {
    renderNavbar();

    // Check if the mobile menu is not visible initially
    const mobileLinks = screen.queryByText("Login");
    expect(mobileLinks).toBeInTheDocument(); // Desktop login should be visible
    expect(screen.queryByRole("list", { hidden: true })).not.toBeInTheDocument(); // Ensure mobile menu is not displayed
  });


});
