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
      <div className="pe-enter-pass pass-vec enter-pass">
        <span>Username</span>
        <input
          type="text"
          value={form.username}
          onChange={(e) => onChange("username", e.target.value)}
        />
        {errors.username && <div className="error mb-3">{errors.username}</div>}
      </div>
      <div
        className="pe-enter-pass enter-pass"
        style={{ position: "relative" }}
      >
        <span>New Password</span>
        <input
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="eye-icon"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>
      {errors.password && <div className="error mb-3">{errors.password}</div>}
      <p style={{ fontSize: "12px" }}>
        Password must be at least 8 characters and include a number and special
        character.
      </p>
      <div
        className="pe-enter-pass pe-con-pass enter-pass"
        style={{ position: "relative" }}
      >
        <span>Confirm Password</span>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
        />
        <span
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="eye-icon"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
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
      <div className="save-changes">
        <button onClick={onSave} className="theme_btn">
          Save changes
        </button>
      </div>
    </section>
  );
};

export default CreateLoginSecuritySettings;
