import React from "react";
import { render, screen } from "@testing-library/react";
import Testimonials from "./Testimonials";
import testimonialIcon from "../assets/testimonialIcon.png"; // Mock import

jest.mock("../assets/testimonialIcon.png", () => "mocked-icon.png"); // Mock image import

describe("Testimonials Component", () => {
  test("renders the heading", () => {
    render(<Testimonials />);
    // Check if the heading is rendered
    const heading = screen.getByText("What Our Patients Say");
    expect(heading).toBeInTheDocument();
  });

  test("renders all testimonials", () => {
    render(<Testimonials />);

    // Check if all the testimonials are rendered with correct text
    expect(
      screen.getByText(
        "This app has made it so easy for me to book appointments with my doctor. Highly recommended!"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Very user-friendly and convenient. I was able to find the right specialist in minutes."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Booking an appointment has never been simpler. Great service and easy to use!"
      )
    ).toBeInTheDocument();

    // Check if the names are rendered
    expect(screen.getByText("- Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("- Michael Smith")).toBeInTheDocument();
    expect(screen.getByText("- Sarah Brown")).toBeInTheDocument();
  });

  test("renders the testimonial icons", () => {
    render(<Testimonials />);

    // Check if the testimonial icons are rendered
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    images.forEach((img) => {
      expect(img).toHaveAttribute("src", "mocked-icon.png");
      expect(img).toHaveAttribute("alt", "Testimonial");
    });
  });
});
