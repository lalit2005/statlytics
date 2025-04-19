import { Link, useNavigate } from "@remix-run/react";
import { RiArrowLeftWideFill } from "@remixicon/react";
import React, { useState } from "react";
import { Input } from "~/components/Input";
import api from "~/lib/axios";

export default function NewWebsiteRoute() {
  const [websiteName, setWebsiteName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/add-new-site", {
        name: websiteName,
        url: domainName,
      });

      setMessage(data.message || "Site created successfully");
      setWebsiteName("");
      setDomainName("");
      alert(JSON.stringify(data, null, 2));
      navigate("/dashboard");
      setIsLoading(false);
    } catch (error: any) {
      setMessage(
        error.response?.data.error || "Something went wrong, please try again."
      );
      setIsLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="max-w-[90%] mx-auto w-full px-4 py-10">
      <div className="text-sm text-zinc-600 hover:text-zinc-400 mb-5">
        <Link to={"/dashboard"} className="block -ml-2">
          <RiArrowLeftWideFill className="scale-75 inline-block -mt-0.5 mr-0.5" />
          Go back
        </Link>
      </div>
      <h1 className="text-2xl font-medium mb-6">Create New Website</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-md">
        <div>
          <label htmlFor="websiteName" className="block mb-1">
            Website Name:
          </label>
          <Input
            type="text"
            id="websiteName"
            name="websiteName"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="domainName" className="block mb-1">
            Domain Name:
          </label>
          <Input
            type="text"
            id="domainName"
            name="domainName"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
        >
          Submit
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
