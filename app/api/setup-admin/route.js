import { NextResponse } from "next/server";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import { getCurrentUser } from "../../lib/session";

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

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const existingAdmin = await prisma.user.findFirst({
      where: {
        accountType: "Admin",
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "Admin setup has already been completed.",
        },
        {
          status: 403,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        accountType: "Admin",
      },
    });

    return NextResponse.json({
      message: "Your account is now an Admin.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        accountType: updatedUser.accountType,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      {
        error: "Failed to set up Admin account.",
      },
      {
        status: 500,
      }
    );
  }
}