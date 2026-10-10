import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
  throw new Error(
    "AUTH_SECRET is not defined in .env"
  );
}

const secret = new TextEncoder().encode(
  secretKey
);

export async function createSession(user) {
  const token = await new SignJWT({
    userId: user.id,
    name: user.name,
    email: user.email,
    profilePicture:
      user.profilePicture || null,
    accountType:
      user.accountType || "Student",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    return payload;
  } catch (error) {
    return null;
  }
}