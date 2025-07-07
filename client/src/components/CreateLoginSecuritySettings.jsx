import React from "react";

const CreateLoginSecuritySettings = ({ form, onChange, errors, onSave }) => (
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
      {errors.username && <div className="error">{errors.username}</div>}
    </div>
    <div className="pe-enter-pass enter-pass">
      <span>New Password</span>
      <input
        type="password"
        value={form.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
      {errors.password && <div className="error">{errors.password}</div>}
      <p>
        Password must be at least 8 characters and include a number and special
        character.
      </p>
    </div>
    <div className="pe-enter-pass pe-con-pass enter-pass">
      <span>Confirm Password</span>
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(e) => onChange("confirmPassword", e.target.value)}
      />
      {errors.confirmPassword && (
        <div className="error">{errors.confirmPassword}</div>
      )}
    </div>
    <div className="save-changes">
      <a href="#" onClick={onSave}>
        Save changes
      </a>
    </div>
  </section>
);

export default CreateLoginSecuritySettings;
