import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { AdminOnboardingSchema } from "@/lib/validators";
import { validateEmail, validateName, validatePhoneUK, sanitizePlainText } from "@/lib/validation";
import { inviteUserToLogin } from "@/app/actions/inviteUserToLogin";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * POST /api/onboarding/admin
 * Admin completes onboarding - updates existing business from waitlist
 */
export async function POST(req) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    
    // Validate with AdminOnboardingSchema
    const validated = AdminOnboardingSchema.parse(body);

    // ===== SANITIZE BUSINESS DATA =====
    
    // Sanitize business name
    const sanitizedBusinessName = sanitizePlainText(validated.businessName.trim()).substring(0, 200);
    if (sanitizedBusinessName.length < 2) {
      return NextResponse.json(
        { error: "Business name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate and sanitize contact email
    const emailValidation = validateEmail(validated.contactEmail);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }
    const sanitizedContactEmail = emailValidation.sanitized;

    // Validate and sanitize contact phone
    let sanitizedContactNumber = null;
    if (validated.contactNumber) {
      const phoneValidation = validatePhoneUK(validated.contactNumber);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: `Contact phone: ${phoneValidation.error}` },
          { status: 400 }
        );
      }
      sanitizedContactNumber = phoneValidation.sanitized;
    }

    // Validate and sanitize admin name
    let sanitizedAdminName = null;
    if (validated.name) {
      const nameValidation = validateName(validated.name);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }
      sanitizedAdminName = nameValidation.sanitized;
    }

    // Sanitize address fields
    const sanitizedAddress1 = validated.address1 
      ? sanitizePlainText(validated.address1.trim()).substring(0, 200)
      : null;
    
    const sanitizedCity = validated.city
      ? sanitizePlainText(validated.city.trim()).substring(0, 100)
      : null;

    // Sanitize website URL
    let sanitizedWebsite = null;
    if (validated.website) {
      try {
        const url = new URL(validated.website);
        sanitizedWebsite = url.toString().substring(0, 500);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid website URL format" },
          { status: 400 }
        );
      }
    }

    // Get the current logged-in user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        adminOfBusiness: true,
        business: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let business;

    // ✅ Check if user already has a business (from waitlist signup)
    if (currentUser.adminOfBusiness) {
      console.log(`📝 Updating existing business from waitlist`);
      
      // UPDATE existing business with sanitized data
      business = await prisma.business.update({
        where: { id: currentUser.adminOfBusiness.id },
        data: {
          name: sanitizedBusinessName,
          type: validated.type,
          email: sanitizedContactEmail,
          phone: sanitizedContactNumber,
          website: sanitizedWebsite,
          address1: sanitizedAddress1,
          city: sanitizedCity,
          postcode: validated.postcode.toUpperCase(),
          lat: body.lat || null,
          lng: body.lng || null,
          approved: true,
        },
      });
    } else {
      console.log(`🆕 Creating new business`);
      
      // CREATE new business with sanitized data
      business = await prisma.business.create({
        data: {
          name: sanitizedBusinessName,
          type: validated.type,
          email: sanitizedContactEmail,
          phone: sanitizedContactNumber,
          website: sanitizedWebsite,
          address1: sanitizedAddress1,
          city: sanitizedCity,
          postcode: validated.postcode.toUpperCase(),
          lat: body.lat || null,
          lng: body.lng || null,
          adminUser: {
            connect: { id: currentUser.id },
          },
          approved: true,
        },
      });
    }

    // Mark admin user as onboarded
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        businessId: business.id,
        adminOnboarded: true,
      },
    });

    console.log(`✅ Business ready: ${business.name} (ID: ${business.id})`);

    // ===== CREATE COORDINATORS WITH SANITIZATION =====
    const createdCoordinators = [];
    const emailResults = []; // Track email results
    
    if (validated.coordinators && validated.coordinators.length > 0) {
      console.log(`📋 Processing ${validated.coordinators.length} coordinators...`);
      
      for (const coord of validated.coordinators) {
        console.log(`\n🔄 Processing coordinator: ${coord.email}`);
        
        // Validate and sanitize coordinator email
        const coordEmailValidation = validateEmail(coord.email);
        if (!coordEmailValidation.valid) {
          console.error(`  ❌ Invalid coordinator email: ${coord.email}`);
          emailResults.push({
            email: coord.email,
            success: false,
            error: coordEmailValidation.error
          });
          continue; // Skip this coordinator
        }
        const sanitizedCoordEmail = coordEmailValidation.sanitized;

        // Check if coordinator email already exists
        const existingCoordinator = await prisma.user.findUnique({
          where: { email: sanitizedCoordEmail },
        });

        if (existingCoordinator) {
          console.log(`  Skipping coordinator ${sanitizedCoordEmail} - email already exists`);
          emailResults.push({
            email: sanitizedCoordEmail,
            success: false,
            error: 'Email already exists'
          });
          continue;
        }

        // Validate and sanitize coordinator name
        const coordNameValidation = validateName(coord.name);
        if (!coordNameValidation.valid) {
          console.error(`  ❌ Invalid coordinator name: ${coord.name}`);
          emailResults.push({
            email: sanitizedCoordEmail,
            success: false,
            error: coordNameValidation.error
          });
          continue;
        }
        const sanitizedCoordName = coordNameValidation.sanitized;

        // Validate and sanitize coordinator phone
        let sanitizedCoordPhone = null;
        if (coord.phone) {
          const coordPhoneValidation = validatePhoneUK(coord.phone);
          if (!coordPhoneValidation.valid) {
            console.error(`  Invalid coordinator phone: ${coord.phone}`);
            emailResults.push({
              email: sanitizedCoordEmail,
              success: false,
              error: coordPhoneValidation.error
            });
            continue;
          }
          sanitizedCoordPhone = coordPhoneValidation.sanitized;
        }

        // Sanitize area name
        let sanitizedArea = null;
        if (coord.area && coord.area.trim()) {
          sanitizedArea = sanitizePlainText(coord.area.trim()).substring(0, 100);
          
          if (sanitizedArea.length < 2) {
            console.error(`  Invalid area name: ${coord.area}`);
            emailResults.push({
              email: sanitizedCoordEmail,
              success: false,
              error: 'Area name must be at least 2 characters'
            });
            continue;
          }
        }


        // Create coordinator user with sanitized data
        const coordinator = await prisma.user.create({
          data: {
            name: sanitizedCoordName,
            email: sanitizedCoordEmail,
            phone: sanitizedCoordPhone,
            role: "COORDINATOR",
            businessId: business.id,
            password: null,
            emailVerified: null,
          },
        });

        // Create/get area and link to coordinator
        if (sanitizedArea) {
          const areaRecord = await prisma.area.upsert({
            where: { name: sanitizedArea },
            update: {},
            create: { name: sanitizedArea },
          });
          console.log(`  Area created/found: ${sanitizedArea}`);

          // Update coordinator with areaId
          await prisma.user.update({
            where: { id: coordinator.id },
            data: { areaId: areaRecord.id },
          });
        }

        console.log(`  Coordinator created: ${coordinator.email}`);

        // Send invitation email (using sanitized data)
        console.log(` Sending email to: ${sanitizedCoordEmail}`);
        const emailResult = await inviteUserToLogin({
          email: sanitizedCoordEmail,
          name: sanitizedCoordName,
          role: "COORDINATOR",
        });
        
        emailResults.push({
          email: sanitizedCoordEmail,
          ...emailResult
        });
        
        if (emailResult.success) {
          console.log(` Email sent successfully to ${sanitizedCoordEmail}`);
        } else {
          console.error(` Email failed for ${sanitizedCoordEmail}:`, emailResult.error);
        }

        createdCoordinators.push({
          id: coordinator.id,
          name: coordinator.name,
          email: coordinator.email,
          area: sanitizedArea,
        });

        // Add small delay between emails (optional, helps with rate limiting)
        if (validated.coordinators.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    console.log('\n📊 Coordinator Creation Summary:');
    emailResults.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.email}: ${result.success ? 'Sent' : result.error}`);
    });

    return NextResponse.json(
      {
        success: true,
        business: {
          id: business.id,
          name: business.name,
          type: business.type,
          email: business.email,
        },
        coordinators: createdCoordinators,
        emailResults, // Return email results for debugging
        message: `Business onboarding complete${createdCoordinators.length > 0 ? ` with ${createdCoordinators.length} coordinator(s)` : ''}.`,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(" Onboarding error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      console.error("Validation errors:", error.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes('adminUserId')) {
        return NextResponse.json(
          { error: "This user is already admin of another business" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "A business or coordinator with this information already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to complete onboarding. Please try again." },
      { status: 500 }
    );
  }
}