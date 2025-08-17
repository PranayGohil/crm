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
  const [error, setError] = useState(""); // store error message

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
        `${process.env.REACT_APP_API_URL}/api/employee/login`,
        { username, password }
      );
      login(data);

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

  return (
    <section className="login fd">
      <div className="fd-forget-password">
        <div className="login-head">
          <div className="login-img fd-img">
            <img src="/SVG/login.svg" alt="login" />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </div>
      </div>
      <div className="fd-stucture">
        <div className="fd-enter-email">
          <p>Usename</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="fd-enter-password fd-enter-email">
          <p>Password</p>
          <div className="login-enter-pass relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <span
              className="absolute top-5 right-3"
              onClick={() => setShowPass(!showPass)}
              style={{ cursor: "pointer" }}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{ color: "red", marginBottom: "8px", fontSize: "0.9rem" }}
          >
            {error}
          </div>
        )}

        <div className="login-change_pass">
          <a href="#">Forgot Password?</a>
        </div>
        <div className="fd-reset-btn">
          <button
            className="theme_btn"
            onClick={handleSubmit}
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
