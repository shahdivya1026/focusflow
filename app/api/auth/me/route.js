import { NextResponse } from "next/server";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../../generated/prisma/client";
import { getCurrentUser } from "../../../lib/session";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "focusemate_db",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        accountType: true,
        createdAt: true,
        lastLogin: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error: "Your account has been deactivated.",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error(
      "Authentication check error:",
      error
    );

    return NextResponse.json(
      {
        error: "Authentication check failed.",
      },
      {
        status: 500,
      }
    );
  }
}