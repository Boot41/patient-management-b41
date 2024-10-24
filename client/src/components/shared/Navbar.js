import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl font-bold text-blue-500">
            HealthConnect
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">

          <Link
            to="/login"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-gray-600 hover:text-blue-500 transition duration-300"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-blue-500 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="space-y-4 p-4">

            <li>
              <Link
                to="/login"
                className="block text-gray-600 hover:text-blue-500"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="block text-gray-600 hover:text-blue-500"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
