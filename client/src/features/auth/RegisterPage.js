import React, { useState } from "react";
import axiosInstance from "../../axiosInstance"; // Use axiosInstance
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "patient", // Default role as patient
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    console.log("Register Data:", formData);

    try {
      console.log("Sending registration request to backend...");
      const response = await axiosInstance.post("/register", formData);
      console.log("Backend response:", response);
      if (response.status === 200) {
        setSuccess("User registered successfully.");
        localStorage.setItem("user_id", response.data.id);
        setError("");
        console.log(
          "User registered successfully, navigating to appropriate page."
        );
        // Redirect based on role
        if (formData.role === "doctor") {
          navigate("/doctor-profile");
        } else {
          navigate("/patient-profile");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError(error.response?.data?.message || "Registration failed");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-black">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
          Register
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-600 mb-4 text-center">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-700 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
