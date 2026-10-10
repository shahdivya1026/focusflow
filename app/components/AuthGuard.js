"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    checkAuthentication();
  }, [router]);

  if (checking) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  return children;
}