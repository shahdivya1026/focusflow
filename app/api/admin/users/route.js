import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

async function getAdminUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
  });

  if (!admin || admin.accountType !== "Admin") {
    return null;
  }

  return admin;
}

// Get all users
export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("Admin users GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}

// Update user role or status
export async function PUT(request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const { userId, accountType, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.id === admin.id && isActive === false) {
      return NextResponse.json(
        {
          error: "You cannot deactivate your own account.",
        },
        {
          status: 400,
        }
      );
    }

    if (user.id === admin.id && accountType === "Student") {
      return NextResponse.json(
        {
          error:
            "You cannot remove Admin access from your own account.",
        },
        {
          status: 400,
        }
      );
    }

    const updateData = {};

    if (
      accountType === "Admin" ||
      accountType === "Student"
    ) {
      updateData.accountType = accountType;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
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

    return NextResponse.json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin users PUT error:", error);

    return NextResponse.json(
      {
        error: "Failed to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

// Delete user
export async function DELETE(request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const userId = Number(body.userId);

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        {
          error: "You cannot delete your own account.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Admin users DELETE error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}

// Reset user password
export async function PATCH(request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const userId = Number(body.userId);
    const newPassword = String(body.newPassword || "");

    if (!userId || !newPassword) {
      return NextResponse.json(
        {
          error: "User ID and new password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Admin password reset error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to reset password.",
      },
      {
        status: 500,
      }
    );
  }
}