import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import NavMain from "../components/NavMain";

const BookingPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: "",
    time: "",
    reason: "",
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch selected doctor's details
    const fetchDoctor = async () => {
      try {
        const response = await axiosInstance.get(`/doctors/${id}`);
        setDoctor(response.data);
        console.log("Fetched doctor:", response.data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };

    //Fetch feedbacks for the selected doctor
    const fetchFeedbacks = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/doctors/${id}/feedbacks`
        );
        setFeedbacks(response.data);
        console.log("Fetched feedbacks:", response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchDoctor();
    fetchFeedbacks();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentDetails({
      ...appointmentDetails,
      [name]: value,
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // Assuming you store the token in localStorage

    try {
      console.log("Booking appointment with details:", appointmentDetails);

      const formattedDatetime = dayjs(
        `${appointmentDetails.date} ${appointmentDetails.time}`
      ).format(); // ISO format

      const response = await axiosInstance.post(
        "/appointment",
        {
          doctor_id: id, // You can pass doctor ID from params
          appointment_datetime: formattedDatetime,
          reason: appointmentDetails.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Appointment booked successfully:", response.data);
      navigate("/patient-dashboard"); // Redirect to appointments page
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
    console.log("Booking appointment with details:", appointmentDetails);
  };

  return (
    <>
      <NavMain />
      <div className="flex flex-col lg:flex-row p-8 bg-gray-100 min-h-screen ">
        {/* Doctor Details Column */}
        <div className="w-full lg:w-1/2 p-6 bg-white border border-gray-200 shadow-lg mb-6 lg:mb-0 mr-1">
          {doctor ? (
            <>
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                Dr. {doctor.username}
              </h2>
              <p className="text-sm text-gray-600">
                Specialization: {doctor.specialization}
              </p>
              <p className="text-sm text-gray-600">
                Experience: {doctor.experience} years
              </p>
              <p className="text-sm text-gray-600">Address: {doctor.address}</p>
            </>
          ) : (
            <p className="text-gray-500">Loading doctor details...</p>
          )}

          {/* Feedbacks Section */}
          <div className="p-4 mt-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Patient Feedbacks</h2>
            <div className="space-y-4">
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">
                      "{feedback.feedback}"
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No feedback available for this doctor.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form Column */}
        <div className="w-full lg:w-1/2 p-6 bg-white border border-gray-200  shadow-lg">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Book an Appointment
          </h2>
          <form onSubmit={handleBooking}>
            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Appointment Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={appointmentDetails.date}
                onChange={handleChange}
                min={
                  new Date(new Date().setDate(new Date().getDate() + 1))
                    .toISOString()
                    .split("T")[0]
                } // Tomorrow's date
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Appointment Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={appointmentDetails.time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Appointment
              </label>
              <textarea
                id="reason"
                name="reason"
                value={appointmentDetails.reason}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              Confirm Appointment
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
