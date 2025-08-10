import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const storedUser = localStorage.getItem("adminUser");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const login = (userData) => {
    localStorage.setItem("adminUser", JSON.stringify(userData?.admin));
    localStorage.setItem("token", JSON.stringify(userData?.token));
    console.log("User logged in:", userData);
    setUser(userData); 
  };

  const logout = () => {
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
