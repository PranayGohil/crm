import React, { useEffect, useState } from "react";

const Footer = () => {
  const [year, setYear] = useState("");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear(currentYear);
  }, []);

  return (
    <div className="w-100 px-2 py-2 flex justify-center items-center">
      <div className="text-sm text-gray-500">
        &copy; <span>{year}</span> Maulshree Jewellery Rendering. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
