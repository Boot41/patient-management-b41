import React, { useState } from "react";
import axiosInstance from "../axiosInstance";

const AIRecommender = ({ setDoctors }) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommend = async () => {
    console.log("User entered symptoms:", symptoms);
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/recommend-doctor", {
        symptoms,
      });

      // Assuming the backend returns an array of recommended doctors
      const recommendedDoctors = response.data.doctors;

      // Update the doctors list in Main.js
      setDoctors(recommendedDoctors);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setError("Failed to get a recommendation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg ">
      <h2 className="text-xl font-bold mb-4">AI Recommender</h2>
      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="Enter your symptoms here..."
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
      />
      <button
        onClick={handleRecommend}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Loading..." : "Recommend Doctor"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default AIRecommender;
