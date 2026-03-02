import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          ...decoded,
          token
        });
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    const decoded = jwtDecode(data.token);
    setUser({
      ...decoded,
      ...data.admin,
      token: data.token
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isSuperAdmin = () => {
    return user?.role === "super-admin";
  };

  const value = {
    user,
    login,
    logout,
    isSuperAdmin,
    isAuthenticated: !!user,
    loading
  };
  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
