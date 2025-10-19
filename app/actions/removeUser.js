// app/actions/removeUser.js
"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Remove a user (coordinator) from the system
 * @param {string} userId - The ID of the user to remove
 * @returns {Promise<{success: boolean, error?: string, message?: string}>}
 */
export async function removeUser(userId) {
  try {
    console.log("🗑️ Attempting to remove user:", userId);

    // 1. Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error("❌ Not authenticated");
      return { success: false, error: "Not authenticated" };
    }

    // 2. Check authorization - only ADMIN can remove users
    if (session.user.role !== "ADMIN") {
      console.error("❌ Unauthorized - user role:", session.user.role);
      return { success: false, error: "Unauthorized. Only admins can remove users." };
    }

    // 3. Validate input
    if (!userId) {
      console.error("❌ User ID is missing");
      return { success: false, error: "User ID is required" };
    }

    // 4. Check if user exists
    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        role: true,
      },
    });

    if (!userToRemove) {
      console.error("❌ User not found:", userId);
      return { success: false, error: "User not found" };
    }

    console.log("📋 User to remove:", {
      id: userToRemove.id,
      email: userToRemove.email,
      role: userToRemove.role,
    });

    // 5. Prevent removing yourself
    if (userToRemove.id === session.user.id) {
      console.error("❌ Attempting to remove self");
      return { success: false, error: "You cannot remove your own account" };
    }

    // 6. Optional: Prevent removing other admins
    if (userToRemove.role === "ADMIN") {
      console.error("❌ Attempting to remove another admin");
      return { success: false, error: "Cannot remove other admin accounts" };
    }

    // 7. Delete the user
    // Note: Make sure your Prisma schema has onDelete: Cascade set up
    // for related records like PasswordResetToken
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`✅ Successfully removed user: ${userToRemove.email}`);

    return { 
      success: true, 
      message: `${userToRemove.name || userToRemove.email} has been removed successfully` 
    };

  } catch (error) {
    console.error("❌ Error removing user:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return { 
        success: false, 
        error: "User not found or already deleted" 
      };
    }

    if (error.code === "P2003") {
      return { 
        success: false, 
        error: "Cannot delete user due to related records. Please contact support." 
      };
    }

    return { 
      success: false, 
      error: error.message || "Failed to remove user. Please try again." 
    };
  }
}