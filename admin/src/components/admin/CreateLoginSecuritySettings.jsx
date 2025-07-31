import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateLoginSecuritySettings = ({ form, onChange, errors, onSave }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  return (
    <section className="login-security2">
      <div className="login-img">
        <span>Login & Security Settings</span>
      </div>
      <div className="row">
        <div className="pe-enter-pass pass-vec enter-pass col-md-4">
          <span>Username</span>
          <input
            type="text"
            value={form.username}
            onChange={(e) => onChange("username", e.target.value)}
          />
          {errors.username && (
            <div className="error mb-3">{errors.username}</div>
          )}
        </div>
        <div
          className="pe-enter-pass enter-pass col-md-4"
        >
          <span>New Password</span>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="w-100"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="eye-icon"
              style={{
                position: "absolute",
                right: "10px",
                top: "30%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {errors.password && (
            <div className="error mb-3">{errors.password}</div>
          )}
          <p style={{ fontSize: "12px" }}>
            Password must be at least 8 characters and include a number and
            special character.
          </p>
        </div>

        <div className="pe-enter-pass pe-con-pass enter-pass col-md-4">
          <span>Confirm Password</span>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-100"
              value={form.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="eye-icon"
              style={{
                position: "absolute",
                right: "10px",
                top: "30%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {errors.confirmPassword && (
            <div className="error mb-3">{errors.confirmPassword}</div>
          )}
        </div>
      </div>

      <div className="save-changes w-100 d-flex justify-content-end mt-2">
        <button onClick={onSave} className="theme_btn">
          Save changes
        </button>
      </div>
    </section>
  );
};

export default CreateLoginSecuritySettings;
