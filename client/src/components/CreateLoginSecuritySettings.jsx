import React from "react";

const CreateLoginSecuritySettings = ({ form, onChange }) => (
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
    </div>
    <div className="pe-enter-pass enter-pass">
      <span>New Password</span>
      <div className="pass-vec">
        <input
          type="password"
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
        <img src="/SVG/password-vec.svg" alt="password" />
      </div>
      <p>
        Password must be at least 8 characters and include a number and a
        special character.
      </p>
    </div>
    <div className="pe-enter-pass pe-con-pass enter-pass">
      <span>Confirm Password</span>
      <div className="pass-vec">
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
        />
        <img src="/SVG/password-vec.svg" alt="password" />
      </div>
    </div>
    <div className="change-password">
      <a href="#">Change Password</a>
    </div>
  </section>
);

export default CreateLoginSecuritySettings;
