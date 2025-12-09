import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

/**
 * POST /api/resend-invitation
 * Resends invitation email to a user
 * Can be called by admins or coordinators for their users
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the user to resend invitation to
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        business: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Authorization check - only allow if:
    // 1. Admin resending to coordinators in their business
    // 2. Coordinator resending to managers in their business
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: true,
      },
    });

    // Check permissions
    if (session.user.role === "ADMIN") {
      // Admin can only resend to coordinators in their business
      if (targetUser.role !== "COORDINATOR") {
        return NextResponse.json(
          { error: "Admins can only resend invitations to coordinators" },
          { status: 403 }
        );
      }
      if (targetUser.businessId !== currentUser.businessId) {
        return NextResponse.json(
          { error: "You can only resend invitations to users in your business" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "COORDINATOR") {
      // Coordinator can only resend to managers in their business
      if (targetUser.role !== "MANAGER") {
        return NextResponse.json(
          { error: "Coordinators can only resend invitations to managers" },
          { status: 403 }
        );
      }
      if (targetUser.businessId !== currentUser.businessId) {
        return NextResponse.json(
          { error: "You can only resend invitations to users in your business" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unauthorized role" },
        { status: 403 }
      );
    }

    console.log(`📧 Resending invitation to: ${targetUser.email} (${targetUser.role})`);

    // Send invitation email
    const emailResult = await inviteUserToLogin({
      email: targetUser.email,
      name: targetUser.name || "User",
      role: targetUser.role,
    });

    if (emailResult.success) {
      console.log(`✅ Invitation resent successfully to ${targetUser.email}`);
      return NextResponse.json({
        success: true,
        message: `Invitation email resent to ${targetUser.email}`,
      });
    } else {
      console.error(`❌ Failed to resend invitation to ${targetUser.email}:`, emailResult.error);
      return NextResponse.json(
        { error: emailResult.error || "Failed to send invitation email" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Resend invitation error:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}