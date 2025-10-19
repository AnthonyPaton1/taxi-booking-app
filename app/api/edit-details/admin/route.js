// app/api/edit-details/admin/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminOnboardingSchema } from "@/lib/validators";
import { z } from "zod";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        adminOfBusiness: true,
        memberships: {
          include: { business: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const business = user.adminOfBusiness || user.memberships?.[0]?.business;

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const coordinators = await prisma.businessMembership.findMany({
      where: { 
        businessId: business.id, 
        role: "COORDINATOR" 
      },
      include: { 
        user: {
          include: {
            area: true
          }
        }
      },
    });

    return NextResponse.json({
      companyId: business.id,
      businessName: business.name,
      contactNumber: business.phone || "",
      contactEmail: business.email || user.email,
      address1: business.address1 || "",
      city: business.city || "",
      postcode: business.postcode || "",
      website: business.website || "",
      coordinators: coordinators.map((c) => ({
        id: c.user.id,
        name: c.user.name || "",
        email: c.user.email,
        phone: c.user.phone || "",
        area: c.user.area?.name || "",
      })),
    });
  } catch (error) {
    console.error("❌ GET /api/edit-details/admin error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    if (!body.companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const validated = AdminOnboardingSchema.parse(body);

    function normalizeWebsite(url) {
      if (!url) return "";
      if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
      }
      return url;
    }

    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        adminOfBusiness: true,
        memberships: true,
      },
    });

    const hasAccess = 
      user?.adminOfBusiness?.id === body.companyId ||
      user?.memberships?.some(m => m.businessId === body.companyId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have permission to edit this business" },
        { status: 403 }
      );
    }

    // ✅ Get list of existing coordinator emails BEFORE transaction
    const existingCoordinatorEmails = await prisma.businessMembership.findMany({
      where: {
        businessId: body.companyId,
        role: "COORDINATOR",
      },
      include: { user: true },
    }).then(coords => coords.map(c => c.user.email));

    console.log("📋 Existing coordinators:", existingCoordinatorEmails);

    // Track new users to invite AFTER transaction
    const newUsersToInvite = [];

    // Use a transaction for database operations only
    await prisma.$transaction(async (tx) => {
      // Update business details
      await tx.business.update({
        where: { id: body.companyId },
        data: {
          name: validated.businessName,
          address1: validated.address1,
          city: validated.city,
          postcode: validated.postcode,
          website: normalizeWebsite(validated.website),
          phone: validated.contactNumber,
          email: validated.contactEmail,
        },
      });

      // Get current memberships for cleanup
      const currentMemberships = await tx.businessMembership.findMany({
        where: {
          businessId: body.companyId,
          role: "COORDINATOR",
        },
        include: { user: true },
      });

      // Delete all current coordinator memberships (we'll recreate them)
      await tx.businessMembership.deleteMany({
        where: {
          businessId: body.companyId,
          role: "COORDINATOR",
        },
      });

      // Process coordinators from the form
      const coordinators = validated.coordinators || [];
      
      for (const coord of coordinators) {
        if (!coord.name || !coord.email) continue;

        // ✅ Check if this is a NEW user (not in existing list)
        const isNewUser = !existingCoordinatorEmails.includes(coord.email);

        if (isNewUser) {
          console.log(`🆕 New user detected: ${coord.email}`);
        } else {
          console.log(`✏️ Updating existing user: ${coord.email}`);
        }

        // Upsert the user
        const coordUser = await tx.user.upsert({
          where: { email: coord.email },
          update: {
            name: coord.name,
            phone: coord.phone,
            area: coord.area
              ? {
                  connectOrCreate: {
                    where: { name: coord.area.trim() },
                    create: { name: coord.area.trim() },
                  },
                }
              : { disconnect: true }, // ✅ Disconnect if no area provided
          },
          create: {
            email: coord.email,
            name: coord.name,
            phone: coord.phone,
            role: "COORDINATOR",
            business: {
              connect: { id: body.companyId },
            },
            area: coord.area
              ? {
                  connectOrCreate: {
                    where: { name: coord.area.trim() },
                    create: { name: coord.area.trim() },
                  },
                }
              : undefined,
          },
        });

        // Recreate membership
        await tx.businessMembership.create({
          data: {
            businessId: body.companyId,
            userId: coordUser.id,
            role: "COORDINATOR",
          },
        });

        // ✅ Only add to invite list if it's a NEW user
        if (isNewUser) {
          newUsersToInvite.push({
            email: coordUser.email,
            name: coordUser.name || "",
            role: "COORDINATOR",
          });
        }
      }

      // Clean up removed coordinators
      const newCoordinatorEmails = coordinators.map(c => c.email);
      const removedCoordinators = currentMemberships.filter(
        ec => !newCoordinatorEmails.includes(ec.user.email)
      );

      for (const removed of removedCoordinators) {
        const otherMemberships = await tx.businessMembership.count({
          where: { userId: removed.user.id },
        });

        if (otherMemberships === 0 && removed.user.role === "COORDINATOR") {
          console.log(`🗑️ User ${removed.user.email} removed from all businesses`);
          // Optional: Delete the user entirely
          // await tx.user.delete({ where: { id: removed.user.id } });
        }
      }
    });

    // ✅ Send invites AFTER transaction succeeds - ONLY to new users
    console.log(`📧 Sending ${newUsersToInvite.length} invite(s)...`);
    
    for (const userToInvite of newUsersToInvite) {
      try {
        await inviteUserToLogin(userToInvite);
        console.log(`✅ Invite sent to NEW user: ${userToInvite.email}`);
      } catch (err) {
        console.error(`❌ Failed to send invite to ${userToInvite.email}:`, err);
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Business details updated successfully",
      invitesSent: newUsersToInvite.length,
      newUsers: newUsersToInvite.map(u => u.email)
    });
    
  } catch (error) {
    console.error("❌ PUT /api/edit-details/admin error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update company", message: error.message },
      { status: 500 }
    );
  }
}