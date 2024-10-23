import React from "react";

import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import landingIcon from "../assets/landingIcon.png";
import serviceIcon1 from "../assets/serviceIcon1.png";
import serviceIcon2 from "../assets/serviceIcon2.png";
import serviceIcon3 from "../assets/serviceIcon3.png";
import testimonialIcon from "../assets/testimonialIcon.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto bg-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-10 items-center ">
        <div className="mb-10 md:mb-0 p-4">
          <h1 className="text-4xl font-bold text-gray-700 mb-4">
            Connecting You to Your Healthcare Needs
          </h1>
          <p className="text-gray-600 mb-8">
            Discover the best doctors, clinics & hospitals near you.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            Book Now
          </button>
        </div>
        <div className="flex justify-center">
          <img className="w-full max-w-sm" src={landingIcon} alt="Healthcare" />
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-20 p-4 border-t-2 border-gray-300 pb-10">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-10">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <img
              src={serviceIcon1}
              alt="Service 1"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Doctor Consultations</h3>
            <p className="text-gray-600">
              Book appointments with experienced doctors and get the healthcare
              you deserve.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <img
              src={serviceIcon2}
              alt="Service 2"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our support team is available 24/7 to assist you with your
              healthcare needs.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <img
              src={serviceIcon3}
              alt="Service 3"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Medical Records</h3>
            <p className="text-gray-600">
              Access your medical records and history anytime, anywhere with our
              platform.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-20 p-4 bg-blue-50 border-t-2 border-gray-300 pb-10">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-10">
          What Our Patients Say
        </h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-sm transition-transform transform hover:scale-105">
            <img
              src={testimonialIcon}
              alt="Testimonial"
              className="w-20 mx-auto mb-6 rounded-full border-4 border-blue-500"
            />
            <p className="text-gray-700 italic mb-6">
              "The platform made it so easy to find a doctor and schedule an
              appointment. Highly recommended!"
            </p>
            <p className="text-blue-700 font-bold">- John Doe</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-sm transition-transform transform hover:scale-105">
            <img
              src={testimonialIcon}
              alt="Testimonial"
              className="w-20 mx-auto mb-6 rounded-full border-4 border-blue-500"
            />
            <p className="text-gray-700 italic mb-6">
              "Thanks to this service, I was able to receive the care I needed
              quickly and efficiently. Great experience!"
            </p>
            <p className="text-blue-700 font-bold">- Jane Smith</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-sm transition-transform transform hover:scale-105">
            <img
              src={testimonialIcon}
              alt="Testimonial"
              className="w-20 mx-auto mb-6 rounded-full border-4 border-blue-500"
            />
            <p className="text-gray-700 italic mb-6">
              "The doctors here are top-notch and the platform is extremely
              user-friendly. I couldn't ask for a better experience!"
            </p>
            <p className="text-blue-700 font-bold">- Sarah Lee</p>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="mt-20 p-4 text-center border-t-2 border-gray-300 pb-10">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">About Us</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We are dedicated to connecting you with the best healthcare providers.
          Our platform provides access to top doctors, hospitals, and clinics,
          making it easy for you to schedule appointments and receive the care
          you need.
        </p>
      </div>

      {/* Footer Section */}
      <div className="mt-20 p-8 bg-gray-800 text-white text-center">
        <p className="mb-4">
          &copy; 2024 Your Healthcare Platform. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
