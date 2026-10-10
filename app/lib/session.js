import { cookies } from "next/headers";
import { verifySession } from "./auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(
    "focusemate_session"
  );

  if (!sessionCookie) {
    return null;
  }

  const session = await verifySession(
    sessionCookie.value
  );

  if (!session) {
    return null;
  }

  return {
    id: Number(session.userId),
    name: session.name,
    email: session.email,
    profilePicture:
      session.profilePicture || null,
    accountType:
      session.accountType || "Student",
  };
}