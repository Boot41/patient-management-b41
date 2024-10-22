import React, { useState, useEffect } from "react";
import NavMain from "../components/NavMain";
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
      <div className="flex">
        {/* Sidebar with Filters */}
        <div className="w-1/4 p-4">
          <FilterSidebar
            selectedSpecialization={selectedSpecialization}
            setSelectedSpecialization={handleSpecializationChange}
          />
        </div>

        {/* Main Content - Search, Sort, and Doctor List */}
        <div className="w-3/4 p-8">
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
            />
            <SortComponent
              sortOption={sortOption}
              setSortOption={handleSortChange}
            />
          </div>

          {/* AI Recommender Section */}
          <div className="mb-8">
            <AIRecommender setDoctors={handleAIRecommendation} />
          </div>

          {/* Doctors List Heading */}
          <h2 className="text-2xl font-bold mb-4">
            {isAIRecommendationActive
              ? "AI Recommended Doctors"
              : "Available Doctors"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-4 bg-white rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-bold mb-2">
                  Dr.{" "}
                  {doctor.username.charAt(0).toUpperCase() +
                    doctor.username.slice(1).toLowerCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  Specialization:{" "}
                  {doctor.specialization.charAt(0).toUpperCase() +
                    doctor.specialization.slice(1).toLowerCase()}{" "}
                </p>
                <p className="text-sm text-gray-600">
                  Experience: {doctor.experience} years
                </p>
                <p className="text-sm text-gray-600">
                  Address: {doctor.address}
                </p>
                <button
                  onClick={() => handleScheduleAppointment(doctor.user_id)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Schedule Appointment
                </button>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <Testimonials />
        </div>
      </div>
      {/* Chatbot Icon */}
      <div
        className="fixed bottom-8 left-8 bg-blue-600 rounded-full p-4 cursor-pointer hover:bg-blue-700"
        onClick={() => setIsChatbotOpen(true)}
      >
        <img src={chatIcon} alt="Chatbot" className="w-8 h-8" />
      </div>

      {/* Virtual Assistant Modal */}
      {isChatbotOpen && (
        <VirtualAssistantModal onClose={() => setIsChatbotOpen(false)} />
      )}
    </>
  );
};

export default Main;
