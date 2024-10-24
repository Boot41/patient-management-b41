import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import NavMain from "../../components/shared/NavMain";

const DoctorDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState("");
  const [loadingFeedbackSummary, setLoadingFeedbackSummary] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axiosInstance.get("/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { upcoming, completed, cancelled } = response.data;

        setUpcomingAppointments(upcoming);
        setCompletedAppointments(completed);
        setCancelledAppointments(cancelled);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchFeedbackSummary = async () => {
      try {
        setLoadingFeedbackSummary(true);
        const token = localStorage.getItem("token");

        const response = await axiosInstance.get("/doctor/feedback-summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFeedbackSummary(response.data.summary);
      } catch (error) {
        console.error("Error fetching feedback summary:", error);
        setFeedbackSummary("Unable to generate feedback summary at this time.");
      } finally {
        setLoadingFeedbackSummary(false);
      }
    };

    fetchAppointments();
    fetchFeedbackSummary();
  }, []);

  const handleCancelAppointment = async (appointment_id) => {
    try {
      const token = localStorage.getItem("token");

      await axiosInstance.patch(
        `/appointments/${appointment_id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cancelledAppointment = upcomingAppointments.find(
        (appointment) => appointment.id === appointment_id
      );

      setUpcomingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointment_id)
      );

      if (cancelledAppointment) {
        setCancelledAppointments((prev) => [
          ...prev,
          { ...cancelledAppointment, isCancelled: true },
        ]);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const handleMarkAsCompleted = async (appointment_id) => {
    try {
      const token = localStorage.getItem("token");

      await axiosInstance.patch(
        `/appointments/${appointment_id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const completedAppointment = upcomingAppointments.find(
        (appointment) => appointment.id === appointment_id
      );

      setUpcomingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointment_id)
      );

      if (completedAppointment) {
        setCompletedAppointments((prev) => [
          ...prev,
          { ...completedAppointment, isCompleted: true },
        ]);
      }
    } catch (error) {
      console.error("Error marking appointment as completed:", error);
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
      <div className="p-8 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-center mb-6">
          Doctor Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
              Upcoming Appointments
            </h3>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => {
                const { formattedDate, formattedTime } = formatDateTime(
                  appointment.appointment_datetime
                );
                return (
                  <div key={appointment.id} className="mb-4">
                    <p className="text-lg font-bold">
                      Patient: {appointment.patient_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {formattedDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {formattedTime}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-2"
                      >
                        Cancel Appointment
                      </button>
                      <button
                        onClick={() => handleMarkAsCompleted(appointment.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
              Completed Appointments
            </h3>
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => {
                const { formattedDate, formattedTime } = formatDateTime(
                  appointment.appointment_datetime
                );
                return (
                  <div key={appointment.id} className="mb-4">
                    <p className="text-lg font-bold">
                      Patient: {appointment.patient_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {formattedDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {formattedTime}
                    </p>
                    <p className="text-lg font-bold">
                      Feedback:{" "}
                      {appointment.feedback
                        ? appointment.feedback
                        : "Feedback not submitted"}
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No completed appointments.</p>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
              Cancelled Appointments
            </h3>
            {cancelledAppointments.length > 0 ? (
              cancelledAppointments.map((appointment) => {
                const { formattedDate, formattedTime } = formatDateTime(
                  appointment.appointment_datetime
                );

                return (
                  <div key={appointment.id} className="mb-4">
                    <p className="text-lg font-bold">
                      Patient: {appointment.patient_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {formattedDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {formattedTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reason: {appointment.reason}
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Status: Cancelled
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No cancelled appointments.</p>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">AI Feedback Insights</h2>
          {loadingFeedbackSummary ? (
            <p>Loading feedback insights...</p>
          ) : (
            <p>{feedbackSummary}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
