import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // store error message

  const validate = () => {
    if (!email.trim()) return "Email or username is required";
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
      setError(""); // clear previous error
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/login`,
        { email, password }
      );
      login(data); // store user in context
      navigate("/"); // redirect to dashboard/home
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
          <p>Email or Username</p>
          <input
            type="text" // <-- was "email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email or username"
          />
        </div>
        <div className="fd-enter-password fd-enter-email">
          <p>Password</p>
          <div className="login-enter-pass">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <img
              src="/SVG/css-eye.svg"
              alt="toggle"
              onClick={() => setShowPass(!showPass)}
              style={{ cursor: "pointer" }}
            />
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
          <div className="login-remember">
            <input type="checkbox" />
            <p>Remember Me</p>
          </div>
          <a href="#">Forgot Password?</a>
        </div>
        <div className="fd-reset-btn">
          <button
            className="theme_btn"
            onClick={handleSubmit}
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
