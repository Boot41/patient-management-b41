import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VirtualAssistantModal from "./VirtualAssistantModal";
import axiosInstance from "../axiosInstance"; // Import axiosInstance to mock it
import DOMPurify from "dompurify";

// Mock axiosInstance
jest.mock("../axiosInstance");

describe("VirtualAssistantModal Component", () => {
  const onCloseMock = jest.fn(); // Mock onClose function

  beforeEach(() => {
    axiosInstance.post.mockResolvedValue({
      data: {
        suggestions: ["Here is some helpful information based on your query."],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the modal with initial assistant message", () => {
    render(<VirtualAssistantModal onClose={onCloseMock} />);

    // Check if the modal title is rendered
    expect(screen.getByText("Virtual Medical Assistant")).toBeInTheDocument();

    // Check if the initial assistant message is rendered
    expect(
      screen.getByText(
        "Hi! I am your Virtual Medical Assistant. I can help you with your pre-appointment preparations?"
      )
    ).toBeInTheDocument();
  });

  test("closes the modal when the close button is clicked", () => {
    render(<VirtualAssistantModal onClose={onCloseMock} />);

    // Click the close button
    fireEvent.click(screen.getByText("×"));

    // Expect the onClose function to have been called
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("sends a message and receives a response from the assistant", async () => {
    render(<VirtualAssistantModal onClose={onCloseMock} />);

    // Type a message in the input
    fireEvent.change(screen.getByPlaceholderText("Type your message here..."), {
      target: { value: "What is the recommended dosage of aspirin?" },
    });

    // Click the send button
    fireEvent.click(screen.getByText("Send"));

    // Check if the user's message is rendered
    expect(
      screen.getByText("What is the recommended dosage of aspirin?")
    ).toBeInTheDocument();

    // Wait for the assistant's response to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          "Here is some helpful information based on your query."
        )
      ).toBeInTheDocument();
    });
  });

  test("displays an error message when the assistant response fails", async () => {
    // Mock axiosInstance to throw an error
    axiosInstance.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<VirtualAssistantModal onClose={onCloseMock} />);

    // Type a message in the input
    fireEvent.change(screen.getByPlaceholderText("Type your message here..."), {
      target: { value: "What is the recommended dosage of aspirin?" },
    });

    // Click the send button
    fireEvent.click(screen.getByText("Send"));

    // Check if the user's message is rendered
    expect(
      screen.getByText("What is the recommended dosage of aspirin?")
    ).toBeInTheDocument();

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          "Sorry, I couldn't process your request. Please try again."
        )
      ).toBeInTheDocument();
    });
  });
});
