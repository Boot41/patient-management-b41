import React from "react";
import { render, screen } from "@testing-library/react";
import Unauthorized from "./Unauthorized";

describe("Unauthorized Component", () => {
  test("renders unauthorized access message", () => {
    render(<Unauthorized />);

    // Check if the heading and paragraph are correctly rendered
    expect(screen.getByText("Unauthorized Access")).toBeInTheDocument();
    expect(
      screen.getByText("You do not have permission to view this page.")
    ).toBeInTheDocument();
  });
});
