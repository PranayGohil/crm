import jwt from "jsonwebtoken";

// admin login controller
export const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.json({ email, token, role: "admin" }); // add role here
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};
