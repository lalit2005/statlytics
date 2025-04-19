import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import api from "~/lib/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await api.get("/me");
      if (user) {
        setIsLoggedIn(true);
        navigate("/dashboard");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="max-w-lg mx-auto w-full px-4 mt-20">
      <p className="text-lg font-medium">Login</p>
      <form
        action=""
        className="space-y-3 mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          api
            .post("/login", { email, password })
            .then((res) => {
              alert(JSON.stringify(res.data, null, 2));
              navigate("/dashboard");
            })
            .catch((err) => {
              console.error(err);
            });
        }}
      >
        <Input
          placeholder="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <Button variant="light" className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
