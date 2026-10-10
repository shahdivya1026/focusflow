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

export async function POST(request) {
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

    const body = await request.json();

    const action = body.action;

    /*
      DEACTIVATE ACCOUNT
    */

    if (action === "deactivate") {
      await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          isActive: false,
        },
      });

      const response = NextResponse.json({
        message: "Your account has been deactivated.",
      });

      response.cookies.set({
        name: "focusemate_session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    /*
      PERMANENTLY DELETE ACCOUNT
    */

    if (action === "delete") {
      await prisma.user.delete({
        where: {
          id: currentUser.id,
        },
      });

      const response = NextResponse.json({
        message: "Your account has been permanently deleted.",
      });

      response.cookies.set({
        name: "focusemate_session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json(
      {
        error: "Invalid account action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error("Account management error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while managing your account.",
      },
      {
        status: 500,
      }
    );
  }
}