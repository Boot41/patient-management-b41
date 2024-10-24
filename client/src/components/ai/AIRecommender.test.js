import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axiosInstance from "../../axiosInstance";
import AIRecommender from "./AIRecommender";

// Mock axiosInstance to handle API requests
jest.mock("../../axiosInstance");

describe("AIRecommender Component", () => {
  const mockSetDoctors = jest.fn(); // Mock function to simulate setDoctors

  beforeEach(() => {
    mockSetDoctors.mockClear(); // Clear mock calls before each test
  });

  test("renders AIRecommender component", () => {
    render(<AIRecommender setDoctors={mockSetDoctors} />);

    // Check if the component renders correctly
    expect(screen.getByText("AI Recommender")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your symptoms here...")
    ).toBeInTheDocument();
    expect(screen.getByText("Recommend Doctor")).toBeInTheDocument();
  });

  test("handles input change in textarea", () => {
    render(<AIRecommender setDoctors={mockSetDoctors} />);

    const textarea = screen.getByPlaceholderText("Enter your symptoms here...");
    fireEvent.change(textarea, { target: { value: "Headache and fever" } });

    // Check if the textarea value is updated
    expect(textarea.value).toBe("Headache and fever");
  });

  test("handles successful doctor recommendation", async () => {
    const mockResponse = {
      data: {
        doctors: [{ name: "Dr. Smith", specialization: "General Medicine" }],
      },
    };

    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    render(<AIRecommender setDoctors={mockSetDoctors} />);

    const textarea = screen.getByPlaceholderText("Enter your symptoms here...");
    const button = screen.getByText("Recommend Doctor");

    fireEvent.change(textarea, { target: { value: "Headache" } });
    fireEvent.click(button);

    // Check if the loading state is shown
    expect(button).toHaveTextContent("Loading...");

    await waitFor(() => {
      // Ensure setDoctors is called with the correct data
      expect(mockSetDoctors).toHaveBeenCalledWith(mockResponse.data.doctors);
    });

    // Ensure loading state is cleared after recommendation is fetched
    expect(button).toHaveTextContent("Recommend Doctor");
  });


});
