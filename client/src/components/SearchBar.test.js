import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar Component", () => {
  let mockSetSearchQuery;

  beforeEach(() => {
    mockSetSearchQuery = jest.fn();
  });

  test("renders the search input field", () => {
    render(<SearchBar searchQuery="" setSearchQuery={mockSetSearchQuery} />);

    const inputElement = screen.getByPlaceholderText(
      "Search doctors by name..."
    );
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue(""); // Initially, the value should be empty
  });


});
