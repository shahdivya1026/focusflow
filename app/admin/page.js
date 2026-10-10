"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      const meResponse = await fetch("/api/auth/me");

      if (!meResponse.ok) {
        router.replace("/login");
        return;
      }

      const meData = await meResponse.json();

      setCurrentUser(meData.user);

      if (meData.user.accountType !== "Admin") {
        router.replace("/");
        return;
      }

      const usersResponse = await fetch("/api/admin/users");

      const usersData = await usersResponse.json();

      if (!usersResponse.ok) {
        setError(
          usersData.error || "Failed to load users."
        );
        return;
      }

      setUsers(usersData.users || []);
    } catch (error) {
      console.error("Admin data loading error:", error);
      setError("Something went wrong while loading users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function updateUser(userId, data) {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update user.");
        return;
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === userId ? result.user : user
        )
      );
    } catch (error) {
      console.error("User update error:", error);
      alert("Something went wrong while updating the user.");
    }
  }

  async function deleteUser(userId, userName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to delete user.");
        return;
      }

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user.id !== userId
        )
      );
    } catch (error) {
      console.error("User deletion error:", error);
      alert("Something went wrong while deleting the user.");
    }
  }

  async function resetPassword(userId, userName) {
    const newPassword = window.prompt(
      `Enter a new password for ${userName}:`
    );

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to reset password.");
        return;
      }

      alert("Password reset successfully.");
    } catch (error) {
      console.error("Password reset error:", error);
      alert("Something went wrong while resetting password.");
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText)
    );
  });

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  const adminUsers = users.filter(
    (user) => user.accountType === "Admin"
  ).length;

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-card">
          <h1>Admin Dashboard</h1>
          <p>Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome, {currentUser?.name}
          </p>
        </div>

        <button
          className="admin-back-button"
          onClick={() => router.push("/")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <section className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <strong>{totalUsers}</strong>
        </div>

        <div className="admin-stat-card">
          <h3>Active Users</h3>
          <strong>{activeUsers}</strong>
        </div>

        <div className="admin-stat-card">
          <h3>Inactive Users</h3>
          <strong>{inactiveUsers}</strong>
        </div>

        <div className="admin-stat-card">
          <h3>Admins</h3>
          <strong>{adminUsers}</strong>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-users-header">
          <div>
            <h2>User Management</h2>
            <p>
              Manage FocuseMate user accounts.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-empty">
            No users found.
          </div>
        ) : (
          <div className="admin-users-list">
            {filteredUsers.map((user) => (
              <div
                className="admin-user-row"
                key={user.id}
              >
                <div className="admin-user-info">
                  <h3>{user.name}</h3>

                  <p>{user.email}</p>

                  <div className="admin-user-meta">
                    <span
                      className={
                        user.accountType === "Admin"
                          ? "admin-role admin-role-admin"
                          : "admin-role"
                      }
                    >
                      {user.accountType}
                    </span>

                    <span
                      className={
                        user.isActive
                          ? "admin-status admin-status-active"
                          : "admin-status admin-status-inactive"
                      }
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="admin-user-actions">
                  {user.id !== currentUser?.id && (
                    <>
                      <button
                        onClick={() =>
                          updateUser(user.id, {
                            accountType:
                              user.accountType === "Admin"
                                ? "Student"
                                : "Admin",
                          })
                        }
                      >
                        {user.accountType === "Admin"
                          ? "Make Student"
                          : "Make Admin"}
                      </button>

                      <button
                        onClick={() =>
                          updateUser(user.id, {
                            isActive: !user.isActive,
                          })
                        }
                      >
                        {user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          resetPassword(
                            user.id,
                            user.name
                          )
                        }
                      >
                        Reset Password
                      </button>

                      <button
                        className="admin-delete-button"
                        onClick={() =>
                          deleteUser(
                            user.id,
                            user.name
                          )
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {user.id === currentUser?.id && (
                    <span className="admin-you-label">
                      You
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}