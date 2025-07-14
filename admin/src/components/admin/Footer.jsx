import React, { useEffect, useState } from "react";

const Footer = () => {
  const [year, setYear] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear(currentYear);
  }, []);

  return (
    <div className="footer_box">
      <p className="copyright_text">
        &copy; <span>{year}</span> Pixel Orbit. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
