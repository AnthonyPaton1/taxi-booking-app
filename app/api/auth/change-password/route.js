import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";


export async function POST(req) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // Get user from database with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
      return Response.json(
        { error: "Cannot change password for OAuth-only accounts." },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return Response.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Optional: Log the password change for security audit
    console.log(`Password changed for user: ${user.email} (ID: ${user.id})`);

    return Response.json(
      { message: "Password changed successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in change-password API:", error);
    return Response.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
