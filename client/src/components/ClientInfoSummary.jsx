import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientInfoSummary = () => {
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`);
        setTotalClients(res.data.length);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  return (
    <section className="main-1">
      <div className="member-inf">
        <div className="inf-sec-1 inf-sec">
          <div className="name1">
            <p>Total Client</p>
            <span>{totalClients}</span>
          </div>
          <div className="inf-icon">
            <img src="/SVG/icon-1.svg" alt="icon-1" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientInfoSummary;
