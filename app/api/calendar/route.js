import { PrismaClient } from "../../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { getCurrentUser } from "../../lib/session";

const adapter = new PrismaMariaDb({
  host: "localhost",
  user: "root",
  password: "",
  database: "focusemate_db",
  port: 3306,
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json(events);
  } catch (error) {
    console.error(
      "Failed to fetch calendar events:",
      error
    );

    return Response.json(
      {
        error: "Failed to fetch calendar events.",
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
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      date,
      title,
      type,
      time,
    } = body;

    if (!date) {
      return Response.json(
        { error: "Event date is required." },
        { status: 400 }
      );
    }

    if (!title || title.trim() === "") {
      return Response.json(
        { error: "Event title is required." },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        date,
        title: title.trim(),
        type: type || "Note",
        time: time || null,
        userId: user.id,
      },
    });

    return Response.json(event, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Failed to create calendar event:",
      error
    );

    return Response.json(
      {
        error: "Failed to create calendar event.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      title,
      type,
      time,
    } = body;

    if (!id) {
      return Response.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    if (!title || title.trim() === "") {
      return Response.json(
        { error: "Event title is required." },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!event) {
      return Response.json(
        { error: "Calendar event not found." },
        { status: 404 }
      );
    }

    const updatedEvent =
      await prisma.calendarEvent.update({
        where: {
          id: event.id,
        },

        data: {
          title: title.trim(),
          type: type || "Note",
          time: time || null,
        },
      });

    return Response.json(updatedEvent);
  } catch (error) {
    console.error(
      "Failed to update calendar event:",
      error
    );

    return Response.json(
      {
        error: "Failed to update calendar event.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { id } = body;

    if (!id) {
      return Response.json(
        { error: "Event ID is required." },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!event) {
      return Response.json(
        { error: "Calendar event not found." },
        { status: 404 }
      );
    }

    await prisma.calendarEvent.delete({
      where: {
        id: event.id,
      },
    });

    return Response.json({
      message:
        "Calendar event deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to delete calendar event:",
      error
    );

    return Response.json(
      {
        error: "Failed to delete calendar event.",
      },
      {
        status: 500,
      }
    );
  }
}