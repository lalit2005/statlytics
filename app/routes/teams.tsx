import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "~/components/Table";
import { Input } from "~/components/Input";
import api from "~/lib/axios";
import ProtectedRoute from "~/components/ProtectedRoute";
import { Button } from "~/components/Button";
import { Link } from "@remix-run/react";
import { RiArrowLeftWideFill } from "@remixicon/react";

interface User {
  email: string;
  role: string;
}

export default function TeamsRoute() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("viewer");

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get("/me");
      setCurrentUser(data.user);
    } catch (err: any) {
      setError(err.response?.data.error || "Failed to fetch current user.");
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data.error || "Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Add a new user
  const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/add-new-user", {
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setSuccess(data.message);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("viewer");
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data.error || "Failed to add user.");
    }
  };

  // Update a user's role
  const updateRole = async (email: string, role: string) => {
    try {
      const { data } = await api.put("/update-user", { email, role });
      setSuccess(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data.error || "Failed to update user role.");
    }
  };

  // Delete a user
  const deleteUser = async (email: string) => {
    try {
      const { data } = await api.delete("/delete-user", {
        data: { email },
      });
      setSuccess(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(
        (err.response?.data.error || "Failed to delete user.") +
          new Date().getTime().toLocaleString()
      );
    }
  };

  // Only ADMIN can manage users
  if (currentUser && currentUser.role !== "admin") {
    return (
      <ProtectedRoute>
        <div className="max-w-[90%] mx-auto w-full px-4 py-10">
          <h1 className="text-2xl font-medium mb-4">Not Permitted</h1>
          <p>You do not have access to manage users.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-[90%] mx-auto w-full px-4 py-10">
        <div className="text-sm text-zinc-600 hover:text-zinc-400 mb-5">
          <Link to={"/dashboard"} className="block -ml-2">
            <RiArrowLeftWideFill className="scale-75 inline-block -mt-0.5 mr-0.5" />
            Go back
          </Link>
        </div>
        <h1 className="text-2xl font-medium mb-6">User Management</h1>

        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-500">{success}</p>}

        <div className="mb-10">
          <h2 className="font-medium mb-4 text-zinc-500">Add New User</h2>
          <form
            onSubmit={addUser}
            className="grid grid-cols-8 gap-4 w-full items-center justify-center"
          >
            <div className="col-span-3">
              <Input
                type="email"
                placeholder="email"
                id="newUserEmail"
                name="newUserEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-span-3">
              <Input
                type="password"
                placeholder="password"
                id="newUserPassword"
                name="newUserPassword"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />
            </div>
            <div className="col-span-1">
              <select
                id="newUserRole"
                name="newUserRole"
                defaultValue="viewer"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full rounded-md bg-white dark:bg-zinc-950"
              >
                <option value="viewer">Viewer</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" variant="light" className="w-full col-span-1">
              <span>Add User</span>
            </Button>
          </form>
        </div>

        <h2 className="text-xl font-medium mb-4">Users</h2>
        <TableRoot>
          <Table>
            <TableHead>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email} className="hover:bg-zinc-900">
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.email, e.target.value)}
                      className="rounded-md bg-zinc-800 text-white disabled:opacity-40"
                      disabled={user.email === currentUser?.email}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="developer">Developer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      className="disabled:opacity-40"
                      onClick={() => deleteUser(user.email)}
                      disabled={user.email === currentUser?.email}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </div>
    </ProtectedRoute>
  );
}
