import React, { useState } from "react";
import api from "~/lib/axios";

export default function NewWebsiteRoute() {
  const [websiteName, setWebsiteName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [message, setMessage] = useState("");

  // ...existing code...
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/v1/add-new-site", {
        name: websiteName,
        url: domainName,
      });

      setMessage(data.message || "Site created successfully");
      setWebsiteName("");
      setDomainName("");
    } catch (error: any) {
      setMessage(
        error.response?.data.error || "Something went wrong, please try again."
      );
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create New Website</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="websiteName">Website Name:</label>
          <input
            type="text"
            id="websiteName"
            name="websiteName"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="domainName">Domain Name:</label>
          <input
            type="text"
            id="domainName"
            name="domainName"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
