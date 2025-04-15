import { useNavigate } from "@remix-run/react";
import api from "~/lib/axios";

const Logout = () => {
  const navigate = useNavigate();
  api
    .post("/api/v1/logout")
    .then(() => {
      navigate("/login");
    })
    .catch((err) => {
      console.error(err);
      alert("Error logging out");
    });
  return (
    <div>
      <h1>Logout</h1>
      <p>You have been logged out.</p>
    </div>
  );
};

export default Logout;
