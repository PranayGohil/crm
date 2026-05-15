import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // First set basic info from token to show UI quickly
          const decoded = jwtDecode(token);
          setUser({ ...decoded, token });

          // Then fetch full profile for latest permissions/data
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.success) {
            setUser({
              ...decoded,
              ...res.data.admin,
              token
            });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
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
