import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import NavMain from "../components/NavMain";

const PatientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axiosInstance.get("/dashboard/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { upcoming, past, cancelled } = response.data;
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
        setCancelledAppointments(cancelled);
        console.log("Fetched appointments:", response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointment_id) => {
    const token = localStorage.getItem("token");
    console.log(token);

    try {
      // Call API to cancel the appointment
      const response = await axiosInstance.put(
        `/appointments/${appointment_id}/cancel`,
        {}, // Put request body can be empty; using an empty object.
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Find the appointment in the current upcoming appointments
      const cancelledAppointment = upcomingAppointments.find(
        (appointment) => appointment.id === appointment_id
      );

      // Update the state
      setUpcomingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointment_id)
      );

      // Add the full appointment object to cancelled appointments
      if (cancelledAppointment) {
        setCancelledAppointments((prev) => [
          ...prev,
          { ...cancelledAppointment, isCancelled: true },
        ]);
      }

      console.log("Appointment cancelled:", appointment_id);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const handleFeedbackChange = (appointmentId, value) => {
    setFeedbacks((prev) => ({ ...prev, [appointmentId]: value }));
  };

  const handleSubmitFeedback = async (appointment_id) => {
    const feedback = feedbacks[appointment_id];
    const token = localStorage.getItem("token");

    try {
      // Make API request to submit feedback
      const response = await axiosInstance.put(
        `/appointments/${appointment_id}/feedback`,
        {
          feedback: feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Feedback submitted successfully:", response.data);

      // Update the pastAppointments state to reflect the new feedback
      setPastAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointment_id
            ? { ...appointment, feedback: feedback }
            : appointment
        )
      );

      setFeedbackSubmitted((prev) => ({ ...prev, [appointment_id]: true }));
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { formattedDate, formattedTime };
  };

  return (
    <>
      <NavMain />
      <div className="p-8">
        {/* Upcoming Appointments Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => {
              const { formattedDate, formattedTime } = formatDateTime(
                appointment.appointment_datetime
              );
              return (
                <div
                  key={appointment.id}
                  className="p-4 mb-4 bg-white rounded-lg shadow-md"
                >
                  <p className="text-lg font-bold">
                    Dr. {appointment.doctor_name}
                  </p>
                  <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  <p className="text-sm text-gray-600">Time: {formattedTime}</p>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                </div>
              );
            })
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        {/* Past Appointments Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Past Appointments</h2>
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => {
              const { formattedDate, formattedTime } = formatDateTime(
                appointment.appointment_datetime
              );
              return (
                <div
                  key={appointment.id}
                  className="p-4 mb-4 bg-white rounded-lg shadow-md"
                >
                  <p className="text-lg font-bold">
                    Dr. {appointment.doctor_name}
                  </p>
                  <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  <p className="text-sm text-gray-600">Time: {formattedTime}</p>
                  {feedbackSubmitted[appointment.id] || appointment.feedback ? (
                    <div className="mt-4">
                      <p className="text-green-600 font-bold">
                        Feedback submitted: "{appointment.feedback}"
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label
                        htmlFor={`feedback-${appointment.id}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Quick Feedback
                      </label>
                      <textarea
                        id={`feedback-${appointment.id}`}
                        rows="2"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your feedback..."
                        value={feedbacks[appointment.id] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(appointment.id, e.target.value)
                        }
                      ></textarea>
                      <button
                        onClick={() => handleSubmitFeedback(appointment.id)}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No past appointments.</p>
          )}
        </div>

        {/* Cancelled Appointments Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Cancelled Appointments</h2>
          {cancelledAppointments.length > 0 ? (
            cancelledAppointments.map((appointment) => {
              const { formattedDate, formattedTime } = formatDateTime(
                appointment.appointment_datetime
              );

              return (
                <div
                  key={appointment.id}
                  className="p-4 mb-4 bg-white rounded-lg shadow-md"
                >
                  <p className="text-lg font-bold">
                    Dr. {appointment.doctor_name}
                  </p>

                  <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  <p className="text-sm text-gray-600">Time: {formattedTime}</p>
                  <p className="text-sm text-gray-600">
                    Reason: {appointment.reason}
                  </p>
                  <p className="text-sm text-red-600 mt-2">Status: Cancelled</p>
                </div>
              );
            })
          ) : (
            <p>No cancelled appointments.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
