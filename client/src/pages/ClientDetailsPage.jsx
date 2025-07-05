import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ClientHeader from "./ClientHeader";
import ClientDetails from "../components/ClientDetails";
import ClientDetailsAndSummary from "../components/ClientDetailsAndSummary";
import ClientActionButtons from "../components/ClientActionButtons";

const ClientDetailsPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);

  useEffect(() => {
    console.log(id);
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`);
        setClient(res.data);
      } catch (error) {
        console.error("Failed to fetch client:", error);
      }
    };
    fetchClient();
  }, [id]);

  if (!client) return <p>Loading...</p>;

  return (
    <>
      <ClientHeader client={client} />
      <ClientDetails client={client} />
      <ClientDetailsAndSummary client={client} />
      <ClientActionButtons clientId={client._id} />
    </>
  );
};

export default ClientDetailsPage;
