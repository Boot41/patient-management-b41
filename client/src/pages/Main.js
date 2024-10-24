import React, { useState, useEffect } from "react";
import NavMain from "../components/shared/NavMain";
import FilterSidebar from "../components/FilterSidebar";
import SearchBar from "../components/SearchBar";
import SortComponent from "../components/SortComponent";
import Testimonials from "../components/Testimonials";
import AIRecommender from "../components/AIRecommender";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import VirtualAssistantModal from "../components/VirtualAssistantModal"; // New component import
import chatIcon from "../assets/chatIcon.png"; // Import chat icon image

const Main = () => {
  const [fullDoctorsList, setFullDoctorsList] = useState([]); // Full list of doctors
  const [doctors, setDoctors] = useState([]); // Filtered list of doctors
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [isAIRecommendationActive, setIsAIRecommendationActive] =
    useState(false); // Tracks AI recommendation status
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch doctors initially and set both fullDoctorsList and doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get("/doctors");
        setFullDoctorsList(response.data);
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Update doctors based on search, filter, and sort whenever they change
  useEffect(() => {
    let filteredDoctors = [...fullDoctorsList]; // Create a copy to avoid in-place modification

    // Apply search filter
    if (searchQuery) {
      filteredDoctors = filteredDoctors.filter((doctor) =>
        doctor.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply specialization filter
    if (selectedSpecialization) {
      filteredDoctors = filteredDoctors.filter(
        (doctor) => doctor.specialization === selectedSpecialization
      );
    }

    // Apply sorting
    if (sortOption) {
      filteredDoctors = filteredDoctors.sort((a, b) => {
        if (sortOption === "experience") {
          return b.experience - a.experience; // Sort by experience (descending)
        } else if (sortOption === "name") {
          return a.username.localeCompare(b.username); // Sort by name (ascending)
        }
        return 0;
      });
    }

    setDoctors(filteredDoctors);
  }, [searchQuery, selectedSpecialization, sortOption, fullDoctorsList]);

  // Function to handle AI recommendations
  const handleAIRecommendation = (recommendedDoctors) => {
    setDoctors(recommendedDoctors);
    setIsAIRecommendationActive(true); // Set AI recommendation status to active
  };

  // Reset AI recommendation status whenever search, filter, or sort is used
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setIsAIRecommendationActive(false);
  };

  const handleSpecializationChange = (specialization) => {
    setSelectedSpecialization(specialization);
    setIsAIRecommendationActive(false);
  };

  const handleSortChange = (sortOption) => {
    setSortOption(sortOption);
    setIsAIRecommendationActive(false);
  };

  const handleScheduleAppointment = (doctorId) => {
    navigate(`/booking/${doctorId}`);
  };

return (
  <>
    <NavMain />
    <div className="flex flex-col lg:flex-row px-4 lg:px-8 py-6 bg-blue-50">
      {/* Sidebar with Filters */}
      <div className="lg:w-1/4 w-full mb-6 lg:mb-0 lg:pr-6">
        <FilterSidebar
          selectedSpecialization={selectedSpecialization}
          setSelectedSpecialization={handleSpecializationChange}
        />
        {/* AI Recommender Section */}
        <div className="mb-8 mt-5">
          <AIRecommender setDoctors={handleAIRecommendation} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            className="w-full lg:w-3/4"
          />
          <SortComponent
            sortOption={sortOption}
            setSortOption={handleSortChange}
            className="w-full lg:w-1/4"
          />
        </div>

        {/* Doctors List Heading */}
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {isAIRecommendationActive
            ? "AI Recommended Doctors"
            : "Available Doctors"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="p-6 bg-white rounded-lg shadow-lg transition transform hover:scale-105"
            >
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Dr.{" "}
                {doctor.username.charAt(0).toUpperCase() +
                  doctor.username.slice(1).toLowerCase()}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Specialization: {doctor.specialization}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Experience: {doctor.experience} years
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Address: {doctor.address}
              </p>
              <button
                onClick={() => handleScheduleAppointment(doctor.user_id)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Schedule Appointment
              </button>
            </div>
          ))}
        </div>
        {/* Testimonials Section */}
        <div className="w-full bg-blue-50 py-10">
          <div className="max-w-screen-lg mx-auto px-4">
            <Testimonials />
          </div>
        </div>
      </div>
    </div>

    {/* Chatbot Icon */}
    <div
      className="fixed bottom-8 left-8 bg-red-500 rounded-full p-2 cursor-pointer hover:bg-blue-300 transition animate-pulse"
      onClick={() => setIsChatbotOpen(true)}
    >
      <img src={chatIcon} alt="Chatbot" className="w-10 h-10" />
    </div>

    {/* Virtual Assistant Modal */}
    {isChatbotOpen && (
      <VirtualAssistantModal onClose={() => setIsChatbotOpen(false)} />
    )}
  </>
);
};

export default Main;
