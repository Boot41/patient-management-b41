import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortComponent from "./SortComponent";

describe("SortComponent", () => {
  let mockSetSortOption;

  beforeEach(() => {
    mockSetSortOption = jest.fn();
  });

  test("renders the sort dropdown with options", () => {
    render(<SortComponent sortOption="" setSortOption={mockSetSortOption} />);

    // Check if the label and select dropdown are present
    expect(screen.getByLabelText("Sort By:")).toBeInTheDocument();

    // Check if the default option is selected
    const selectElement = screen.getByLabelText("Sort By:");
    expect(selectElement).toHaveValue("");

    // Check if all options are available
    expect(screen.getByText("Select")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });



});
