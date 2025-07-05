import React from 'react';

const LoginForm = () => {
    // const loginData = {
    //   emailPlaceholder: "you@example.com",
    //   passwordPlaceholder: "Enter your password",
    //   rememberText: "Remember Me",
    //   forgotPassword: "Forgot Password?",
    //   loginText: "Login",
    //   noAccountText: "Don't have an account?",
    //   createAccountText: "Create one"
    // };
    // TODO: Replace with API call

    return (
        <section className="login fd">
            <div className="fd-forget-password">
                <div className="login-head">
                    <div className="login-img fd-img">
                        <img src="/SVG/login.svg" alt="ff" />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Login to your account</p>
                </div>
            </div>
            <div className="fd-stucture">
                <div className="fd-enter-email">
                    <p>Email</p>
                    <input type="email" placeholder="you@example.com" />
                </div>
                <div className="fd-enter-password fd-enter-email">
                    <p>Password</p>
                    <div className="login-enter-pass">
                        <input type="password" placeholder="Enter your password" />
                        <img src="/SVG/css-eye.svg" alt="" />
                    </div>
                </div>
                <div className="login-change_pass">
                    <div className="login-remember">
                        <input type="checkbox" />
                        <p>Remember Me</p>
                    </div>
                    <a href="#">Forgot Password?</a>
                </div>
                <div className="fd-reset-btn">
                    <span><a href="#">Login</a></span>
                    <div className="fd-reset-link">
                        <a href="#" className="no-acc">Don't have an account? </a>
                        <a href="#">Create one</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginForm;
