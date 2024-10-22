import React from "react";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  return (
    <div className="container mx-auto">
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-2 mt-10 items-center">
        <div className="mb-10 md:mb-0 p-4">
          <h1 className="text-4xl font-bold text-gray-700 mb-4">
            Connecting You to Your Healthcare Needs
          </h1>
          <p className="text-gray-600 mb-8">
            Discover the best doctors, clinic & hospital the city nearest to
            you.
          </p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Book Now
          </button>
        </div>
        <div className="flex justify-center">
          <img
            className="w-full max-w-sm"
            src="path_to_image"
            alt="Healthcare"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
