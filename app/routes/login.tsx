import { redirect } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import api from "~/lib/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="max-w-lg mx-auto w-full px-4 mt-20">
      <p className="text-lg font-medium">Login</p>
      <form
        action=""
        className="space-y-3 mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          api
            .post("/api/v1/login", { email, password })
            .then((res) => {
              alert(JSON.stringify(res.data, null, 2));
              redirect("/dashboard");
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
