import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token && role ? { token, role } : null;
  });

const login = (userData, navigate) => {
  localStorage.setItem("token", userData.access_token);
  localStorage.setItem("role", userData.role);
  setUser(userData);

  // Navigate after successful login
  if (userData.role === "patient") {
    navigate("/main");
  } else if (userData.role === "doctor") {
    navigate("/doctor-dashboard");
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
