import React, { useEffect, useState } from "react";

const Footer = () => {
  const [year, setYear] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear(currentYear);
  }, []);

  return (
    <div className="w-100 px-4 py-3 flex justify-center items-center">
      <div className="">
        &copy; <span>{year}</span> Pixel Orbit. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
