import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import AuthContext from "../../contexts/AuthContext";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", password: "" });
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
    try {
      const response = await axiosInstance.post("/token", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        login(response.data , navigate); // Set user data in context
        if (response.data.role === "patient") {
          navigate("/main");
        } else if (response.data.role === "doctor") {
          navigate("/doctor-dashboard");
        } else {
          setError("Login failed: Unknown user role");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Welcome Back!
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity duration-300 shadow-lg"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-700">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
