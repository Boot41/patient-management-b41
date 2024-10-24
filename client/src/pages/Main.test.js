import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Main from "./Main";
import axiosInstance from "../axiosInstance";
import { MemoryRouter } from "react-router-dom";

// Mock necessary components
jest.mock("../axiosInstance");
jest.mock("../components/NavMain", () => () => (
  <div data-testid="nav-main">NavMain</div>
));
jest.mock("../components/FilterSidebar", () => () => (
  <div data-testid="filter-sidebar">FilterSidebar</div>
));
jest.mock("../components/SearchBar", () => (props) => (
  <input
    data-testid="search-bar"
    value={props.searchQuery}
    onChange={(e) => props.setSearchQuery(e.target.value)}
    placeholder="Search"
  />
));
jest.mock("../components/SortComponent", () => (props) => (
  <select
    data-testid="sort-component"
    value={props.sortOption}
    onChange={(e) => props.setSortOption(e.target.value)}
  >
    <option value="experience">Sort by Experience</option>
    <option value="name">Sort by Name</option>
  </select>
));
jest.mock("../components/Testimonials", () => () => (
  <div data-testid="testimonials">Testimonials</div>
));
jest.mock("../components/AIRecommender", () => () => (
  <div data-testid="ai-recommender">AIRecommender</div>
));
jest.mock("../components/VirtualAssistantModal", () => (props) => (
  <div data-testid="virtual-assistant-modal">
    Virtual Assistant Modal
    <button onClick={props.onClose}>Close</button>
  </div>
));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Main Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the main page with all sections", async () => {
    // Mock axios to return doctors list
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          id: 1,
          username: "doctor1",
          specialization: "Cardiology",
          experience: 10,
          address: "123 Heart Lane",
          user_id: 1,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );

    // Check if the main sections are rendered
    expect(screen.getByTestId("nav-main")).toBeInTheDocument();
    expect(screen.getByTestId("filter-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("sort-component")).toBeInTheDocument();
    expect(screen.getByTestId("testimonials")).toBeInTheDocument();

    // Wait for the doctors list to be displayed
    await waitFor(() => {
      expect(screen.getByText("Dr. Doctor1")).toBeInTheDocument();
    });

    

    await waitFor(() => {
      expect(screen.getByText("Experience: 10 years")).toBeInTheDocument();
    });
  });

  test("handles scheduling appointments", async () => {
    // Mock axios to return doctors list
    axiosInstance.get.mockResolvedValue({
      data: [
        {
          id: 1,
          username: "doctor1",
          specialization: "Cardiology",
          experience: 10,
          address: "123 Heart Lane",
          user_id: 1,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );

    // Wait for doctors to load
    await waitFor(() => {
      expect(screen.getByText("Dr. Doctor1")).toBeInTheDocument();
    });

    // Click "Schedule Appointment" button
    fireEvent.click(screen.getByText("Schedule Appointment"));

    // Ensure the correct URL is passed to navigate
    expect(mockNavigate).toHaveBeenCalledWith("/booking/1"); // The correct user_id is passed
  });
});
