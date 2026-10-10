import { NextResponse } from "next/server";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

import { getCurrentUser } from "../../lib/session";
import { createSession } from "../../lib/auth";

import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const accountTypes = [
  "Student",
  "Professional",
  "Developer",
  "Teacher",
  "Other",
];

export async function PUT(request) {
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

    const {
      name,
      email,
      profilePicture,
      accountType,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email || email.trim() === "") {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanEmail = email
      .toLowerCase()
      .trim();

    const emailUser =
      await prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    if (
      emailUser &&
      emailUser.id !== currentUser.id
    ) {
      return NextResponse.json(
        {
          error:
            "This email is already being used by another account.",
        },
        {
          status: 409,
        }
      );
    }

    if (!accountTypes.includes(accountType)) {
      return NextResponse.json(
        {
          error:
            "Please select a valid account type.",
        },
        {
          status: 400,
        }
      );
    }

    let savedProfilePicture = null;

    /*
      No profile picture
    */

    if (!profilePicture) {
      savedProfilePicture = null;
    }

    /*
      Internet image URL
    */

    else if (
      profilePicture.startsWith(
        "http://"
      ) ||
      profilePicture.startsWith(
        "https://"
      )
    ) {
      savedProfilePicture =
        profilePicture.trim();
    }

    /*
      Image selected from PC
      Base64 image is converted into
      a real image file.
    */

    else if (
      profilePicture.startsWith(
        "data:image/"
      )
    ) {
      const matches =
        profilePicture.match(
          /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/
        );

      if (!matches) {
        return NextResponse.json(
          {
            error:
              "Invalid image format.",
          },
          {
            status: 400,
          }
        );
      }

      const imageType =
        matches[1].toLowerCase();

      const imageData = matches[2];

      const allowedTypes = [
        "jpeg",
        "jpg",
        "png",
        "webp",
        "gif",
      ];

      if (
        !allowedTypes.includes(
          imageType
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Please select a JPG, PNG, WEBP or GIF image.",
          },
          {
            status: 400,
          }
        );
      }

      const imageBuffer =
        Buffer.from(
          imageData,
          "base64"
        );

      if (
        imageBuffer.length >
        5 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            error:
              "Image is too large. Please choose an image smaller than 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      const profileFolder =
        path.join(
          process.cwd(),
          "public",
          "profile"
        );

      if (
        !fs.existsSync(
          profileFolder
        )
      ) {
        fs.mkdirSync(
          profileFolder,
          {
            recursive: true,
          }
        );
      }

      const uniqueName =
        crypto.randomUUID() +
        "." +
        imageType;

      const filePath =
        path.join(
          profileFolder,
          uniqueName
        );

      fs.writeFileSync(
        filePath,
        imageBuffer
      );

      savedProfilePicture =
        "/profile/" +
        uniqueName;
    }

    else {
      return NextResponse.json(
        {
          error:
            "Please choose an image from your PC or enter a valid image URL.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: currentUser.id,
        },

        data: {
          name: name.trim(),
          email: cleanEmail,
          profilePicture:
            savedProfilePicture,
          accountType,
        },
      });

    const newToken =
      await createSession(
        updatedUser
      );

    const response =
      NextResponse.json({
        message:
          "Profile updated successfully.",

        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePicture:
            updatedUser.profilePicture,
          accountType:
            updatedUser.accountType,
          createdAt:
            updatedUser.createdAt,
          lastLogin:
            updatedUser.lastLogin,
          isActive:
            updatedUser.isActive,
        },
      });

    response.cookies.set({
      name: "focusemate_session",
      value: newToken,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(
      "Profile update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}