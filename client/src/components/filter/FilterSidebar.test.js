import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterSidebar from "./FilterSidebar";

describe("FilterSidebar Component", () => {
  const mockSetSelectedSpecialization = jest.fn();

  beforeEach(() => {
    mockSetSelectedSpecialization.mockClear();
  });

  test("renders FilterSidebar component with all specializations", () => {
    render(
      <FilterSidebar
        selectedSpecialization=""
        setSelectedSpecialization={mockSetSelectedSpecialization}
      />
    );

    // Check if the heading is rendered
    expect(screen.getByText("Filter by Specialization")).toBeInTheDocument();

    // Check if all specialization options are rendered
    expect(screen.getByLabelText("Cardiologist")).toBeInTheDocument();
    expect(screen.getByLabelText("Dentist")).toBeInTheDocument();
    expect(screen.getByLabelText("General Practitioner")).toBeInTheDocument();
    expect(screen.getByLabelText("Dermatologist")).toBeInTheDocument();
    expect(screen.getByLabelText("Orthopedic")).toBeInTheDocument();
    expect(screen.getByLabelText("Pediatrician")).toBeInTheDocument();

    // Check if "All Specializations" option is rendered
    expect(screen.getByLabelText("All Specializations")).toBeInTheDocument();
  });

  test("selects a specialization", () => {
    render(
      <FilterSidebar
        selectedSpecialization=""
        setSelectedSpecialization={mockSetSelectedSpecialization}
      />
    );

    // Simulate selecting "Dentist"
    const dentistRadio = screen.getByLabelText("Dentist");
    fireEvent.click(dentistRadio);

    // Check if the correct value is passed to setSelectedSpecialization
    expect(mockSetSelectedSpecialization).toHaveBeenCalledWith("Dentist");
  });

  test("selects 'All Specializations' option", () => {
    render(
      <FilterSidebar
        selectedSpecialization="Dentist"
        setSelectedSpecialization={mockSetSelectedSpecialization}
      />
    );

    // Simulate selecting "All Specializations"
    const allSpecializationsRadio = screen.getByLabelText(
      "All Specializations"
    );
    fireEvent.click(allSpecializationsRadio);

    // Check if the correct value (empty string) is passed to setSelectedSpecialization
    expect(mockSetSelectedSpecialization).toHaveBeenCalledWith("");
  });

  test("preselects a specialization when provided", () => {
    render(
      <FilterSidebar
        selectedSpecialization="Pediatrician"
        setSelectedSpecialization={mockSetSelectedSpecialization}
      />
    );

    // Check if "Pediatrician" radio is preselected
    const pediatricianRadio = screen.getByLabelText("Pediatrician");
    expect(pediatricianRadio).toBeChecked();

    // Other radios should not be checked
    expect(screen.getByLabelText("Cardiologist")).not.toBeChecked();
    expect(screen.getByLabelText("Dentist")).not.toBeChecked();
  });
});
