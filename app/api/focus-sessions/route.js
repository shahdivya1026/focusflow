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

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const sessions =
      await prisma.focusSession.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          startTime: "desc",
        },
      });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error(
      "Failed to fetch focus sessions:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch focus sessions.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
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

    const {
      startTime,
      endTime,
      duration,
    } = body;

    if (
      !startTime ||
      !endTime ||
      duration === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Start time, end time and duration are required.",
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await prisma.focusSession.create({
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          duration: Number(duration),
          userId: user.id,
        },
      });

    return NextResponse.json(session, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Failed to save focus session:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to save focus session.",
      },
      {
        status: 500,
      }
    );
  }
}