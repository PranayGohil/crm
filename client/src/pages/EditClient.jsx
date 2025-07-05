// src/pages/EditClient.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import EditClientHeader from "../components/EditClientHeader";
import ClientFormEdit from "../components/ClientFormEdit";
import SubtaskActionsEdit from "../components/SubtaskActionsEdit";

const EditClient = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`);
        console.log(res.data);
        setClient(res.data);
      } catch (err) {
        console.error("Error fetching client data:", err);
      }
    };
    fetchClient();
  }, [id]);

  if (!client) return <p>Loading...</p>;

  return (
    <>
      <EditClientHeader title="Edit Client" />
      <ClientFormEdit client={client} setClient={setClient} />
      {/* <SubtaskActionsEdit client={client} /> */}
    </>
  );
};

export default EditClient;
