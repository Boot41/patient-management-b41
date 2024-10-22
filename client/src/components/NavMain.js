import React from "react";
import { useNavigate } from "react-router-dom";

const NavMain = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const role = localStorage.getItem("role");

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Patient Appointment System
      </h1>
      <div className="flex space-x-4">
        {role !== "doctor" && (
          <button
            onClick={() => navigate("/patient-dashboard")}
            className=" bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Dashboard
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavMain;
