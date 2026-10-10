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

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);

    return Response.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
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
      title,
      description,
      startDate,
      endDate,
      totalHours,
    } = body;

    if (!title || title.trim() === "") {
      return Response.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),

        description:
          description?.trim() || null,

        startDate: startDate
          ? new Date(startDate)
          : null,

        endDate: endDate
          ? new Date(endDate)
          : null,

        totalHours:
          totalHours !== undefined &&
          totalHours !== ""
            ? Number(totalHours)
            : null,

        userId: user.id,
      },
    });

    return Response.json(task, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create task:", error);

    return Response.json(
      { error: "Failed to create task." },
      { status: 500 }
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
      description,
      startDate,
      endDate,
      totalHours,
      completed,
    } = body;

    if (!id) {
      return Response.json(
        { error: "Task ID is required." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!task) {
      return Response.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: task.id,
      },

      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description:
            description?.trim() || null,
        }),

        ...(startDate !== undefined && {
          startDate: startDate
            ? new Date(startDate)
            : null,
        }),

        ...(endDate !== undefined && {
          endDate: endDate
            ? new Date(endDate)
            : null,
        }),

        ...(totalHours !== undefined && {
          totalHours:
            totalHours !== ""
              ? Number(totalHours)
              : null,
        }),

        ...(completed !== undefined && {
          completed: Boolean(completed),
        }),
      },
    });

    return Response.json(updatedTask);
  } catch (error) {
    console.error("Failed to update task:", error);

    return Response.json(
      { error: "Failed to update task." },
      { status: 500 }
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
        { error: "Task ID is required." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!task) {
      return Response.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: {
        id: task.id,
      },
    });

    return Response.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete task:", error);

    return Response.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}