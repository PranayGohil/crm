import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!password.trim()) return "Password is required";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/client/login`,
        { username, password }
      );
      login(data);
      localStorage.setItem("clientUsername", data.username);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Login failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Top Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
            <img
              src="/SVG/login.svg"
              alt="login"
              className="w-6 h-7 md:w-7 md:h-8"
              style={{ filter: "opacity(0.5) drop-shadow(0 0 0 blue)" }}
            />
          </div>
          <h1 className="text-gray-800 font-bold text-xl md:text-2xl leading-7 md:leading-8 text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-5 md:leading-6 text-center">
            Login to your account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl md:rounded-2xl p-6 md:p-8 w-full">
          {/* Username */}
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-700 font-medium text-sm md:text-base mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-sm md:text-base"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 md:mb-6">
              <div className="text-red-500 text-sm md:text-base bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            onKeyPress={handleKeyPress}
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-sm md:text-base font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </div>

        
      </div>
    </section>
  );
};

export default LoginPage;
