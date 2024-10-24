import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";

const PatientProfile = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    address: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Patient Profile Data:", formData);

    // Retrieve user_id from local storage
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("User ID is missing. Please register first.");
      return;
    }

    // Add user_id to formData
    const profileData = {
      ...formData,
      user_id: parseInt(userId), // Add the user_id to the profile data
    };

    try {
      console.log("Submitting patient profile...");
      const response = await axiosInstance.post(
        "/patient-profile",
        profileData
      );
      console.log("Backend response:", response);
      if (response.status === 200) {
        navigate("/login"); // Redirect to patient dashboard after saving profile
      }
    } catch (error) {
      console.error("Error submitting patient profile:", error);
      setError("Failed to save patient profile.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Patient Profile</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
