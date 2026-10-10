"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, []);

  function getPageTitle() {
    if (pathname === "/") {
      return "Dashboard";
    }

    if (pathname === "/tasks") {
      return "Tasks";
    }

    if (pathname === "/calendar") {
      return "Calendar";
    }

    if (pathname === "/productivity") {
      return "Productivity";
    }

    if (pathname === "/pomodoro") {
      return "Focus Timer";
    }

    if (pathname === "/profile") {
      return "Profile";
    }

    return "FocuseMate";
  }

  function getTodayDate() {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleSearch(event) {
    event.preventDefault();

    if (!search.trim()) {
      return;
    }

    router.push("/tasks?search=" + encodeURIComponent(search.trim()));
  }

  function handleProfile() {
    setProfileOpen(false);
    router.push("/profile");
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div>
          <p className="navbar-page-label">FOCUSEMATE</p>
          <h1>{getPageTitle()}</h1>
        </div>
      </div>

      <div className="navbar-right">
        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <button
          type="button"
          className="notification-button"
          title="Notifications"
        >
          🔔
        </button>

        <div className="navbar-date">
          <span>📅</span>
          <p>{getTodayDate()}</p>
        </div>

        <div className="navbar-profile-wrapper">
          <button
            type="button"
            className="navbar-profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="navbar-avatar-image"
              />
            ) : (
              <div className="navbar-avatar">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
            )}

            <div className="navbar-user-info">
              <p className="navbar-user-name">
                {user?.name || "User"}
              </p>

              <p className="navbar-user-role">
                {user?.accountType || "Student"}
              </p>
            </div>

            <span className="profile-arrow">
              {profileOpen ? "▲" : "▼"}
            </span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="dropdown-avatar-image"
                  />
                ) : (
                  <div className="dropdown-avatar">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}

                <div>
                  <strong>{user?.name || "User"}</strong>
                  <span>{user?.email || ""}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button
                type="button"
                onClick={handleProfile}
              >
                👤 My Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="dropdown-logout"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}