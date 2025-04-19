import React from "react";
import { Navigate } from "react-router-dom";
import api from "~/lib/axios";
import Sidebar from "./Sidebar";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null; // Optionally render a loading spinner here
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Sidebar>{children}</Sidebar>;
};

export default ProtectedRoute;
