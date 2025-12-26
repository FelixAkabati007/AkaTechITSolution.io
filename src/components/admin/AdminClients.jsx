import React, { useState, useEffect, useCallback } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";
import { useToast } from "@components/ui/ToastProvider";
import { io } from "socket.io-client";
import { getApiUrl, getSocketUrl } from "@lib/config";

export const AdminClients = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${getApiUrl()}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // Fallback to mock if API fails or not admin
        console.warn("Failed to fetch users, falling back to mock data");
        setUsers(mockService.getUsers());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(mockService.getUsers());
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const socket = io(getSocketUrl());

    socket.on("user_registered", (registeredUser) => {
      setUsers((prevUsers) => {
        // Prevent duplicates
        if (
          prevUsers.some(
            (u) =>
              u.id === registeredUser.id || u.email === registeredUser.email
          )
        ) {
          return prevUsers;
        }
        addToast(`New client registered: ${registeredUser.name}`, "info");
        return [...prevUsers, registeredUser];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [addToast]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!newUser.name || !newUser.email || (!newUser.id && !newUser.password)) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, accountType: "manual" }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("User registered successfully!", "success");
        fetchUsers();
        setIsModalOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "client" });
      } else {
        addToast(data.error || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      addToast("An error occurred during registration", "error");
    }
  };

  const handleEditUser = (user) => {
    setNewUser({ ...user, password: "" }); // Don't show password
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // API call to delete user would go here
      mockService.deleteUser(id);
      setUsers(mockService.getUsers());
      addToast("User deleted (mock)", "info");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          User Management
        </h2>
        <button
          onClick={() => {
            setNewUser({ name: "", email: "", password: "", role: "client" });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Account Type
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-akatech-gold flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-mono text-gray-600 dark:text-gray-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {user.accountType || "manual"}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {user.joinedAt
                      ? new Date(user.joinedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-400 hover:text-akatech-gold transition-colors"
                      aria-label="Edit user"
                      title="Edit User"
                    >
                      <Icons.PenTool className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete user"
                      title="Delete User"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-akatech-card w-full max-w-md rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {newUser.id ? "Edit User" : "Add New User"}
            </h3>
            <form
              onSubmit={handleRegister}
              className="space-y-4"
              aria-label={newUser.id ? "edit-user-form" : "add-user-form"}
            >
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="userName"
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              {!newUser.id && (
                <div>
                  <label
                    htmlFor="userPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="userPassword"
                    type="password"
                    required={!newUser.id}
                    placeholder={
                      newUser.id ? "Leave blank to keep current" : ""
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={newUser.password || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="userRole"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Role
                </label>
                <select
                  id="userRole"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="client">Client</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="finance">Finance</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
                >
                  {newUser.id ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
