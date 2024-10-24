import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import Main from "./pages/Main";
import BookingPage from "./features/booking/Booking";
import PatientDashboard from "./features/dashboard/PatientDashboard";
import DoctorDashboard from "./features/dashboard/DoctorDashboard";
import PatientProfile from "./features/profile/PatientProfile";
import DoctorProfile from "./features/profile/DoctorProfile";
import Unauthorized from "./pages/Unauthorized";
import PrivateRoute from "./components/shared/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/main"
            element={
              <PrivateRoute allowedRoles={["patient"]} element={<Main />} />
            }
          />
          <Route
            path="/booking/:id"
            element={
              <PrivateRoute
                allowedRoles={["patient"]}
                element={<BookingPage />}
              />
            }
          />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />

          <Route
            path="/patient-dashboard"
            element={
              <PrivateRoute
                allowedRoles={["patient"]}
                element={<PatientDashboard />}
              />
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <PrivateRoute
                allowedRoles={["doctor"]}
                element={<DoctorDashboard />}
              />
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
