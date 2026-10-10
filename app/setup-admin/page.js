"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        console.error("User check failed:", error);
        setError("Unable to check your account.");
      } finally {
        setChecking(false);
      }
    }

    checkUser();
  }, [router]);

  async function handleSetupAdmin() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Admin setup failed.");
        return;
      }

      setMessage(
        "Your account has been successfully made an Admin."
      );
    } catch (error) {
      console.error("Admin setup failed:", error);

      setError(
        "Something went wrong while setting up Admin."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="setup-admin-page">
        <div className="setup-admin-card">
          <h1>FocuseMate Admin Setup</h1>
          <p>Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="setup-admin-page">
      <div className="setup-admin-card">
        <h1>FocuseMate Admin Setup</h1>

        <p className="setup-admin-description">
          This page is used only to create the first Admin
          account for FocuseMate.
        </p>

        {user && (
          <div className="setup-admin-user">
            <p>
              <strong>Name:</strong> {user.name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Current Role:</strong>{" "}
              {user.accountType}
            </p>
          </div>
        )}

        {message && (
          <p className="setup-admin-success">
            {message}
          </p>
        )}

        {error && (
          <p className="setup-admin-error">
            {error}
          </p>
        )}

        {!message && (
          <button
            onClick={handleSetupAdmin}
            disabled={loading}
          >
            {loading ? "Setting up..." : "Make Me Admin"}
          </button>
        )}

        {message && (
          <button
            onClick={() => router.push("/admin")}
          >
            Go to Admin Page
          </button>
        )}
      </div>
    </main>
  );
}