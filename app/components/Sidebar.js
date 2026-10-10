"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setIsAdmin(
          data.user?.accountType === "Admin"
        );
      } catch (error) {
        console.error(
          "Admin check failed:",
          error
        );
      }
    }

    checkAdmin();
  }, []);

  function goToPage(path) {
    router.push(path);
  }

  return (
    <aside>
      <h2>FocuseMate</h2>

      <nav>
        <p
          className={pathname === "/" ? "active" : ""}
          onClick={() => goToPage("/")}
        >
          Dashboard
        </p>

        <p
          className={pathname === "/tasks" ? "active" : ""}
          onClick={() => goToPage("/tasks")}
        >
          Tasks
        </p>

        <p
          className={pathname === "/calendar" ? "active" : ""}
          onClick={() => goToPage("/calendar")}
        >
          Calendar
        </p>

        <p
          className={
            pathname === "/productivity"
              ? "active"
              : ""
          }
          onClick={() => goToPage("/productivity")}
        >
          Productivity
        </p>

        <p
          className={
            pathname === "/pomodoro"
              ? "active"
              : ""
          }
          onClick={() => goToPage("/pomodoro")}
        >
          Focus Timer
        </p>

        {isAdmin && (
          <p
            className={
              pathname === "/admin"
                ? "active"
                : ""
            }
            onClick={() => goToPage("/admin")}
          >
            Admin
          </p>
        )}
      </nav>
    </aside>
  );
}