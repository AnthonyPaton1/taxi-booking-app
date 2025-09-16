// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const roles = [
    { email: "superadmin@example.com", name: "Super Admin", role: "SUPER_ADMIN" },
    { email: "admin@example.com", name: "Business Admin", role: "ADMIN" },
    { email: "manager@example.com", name: "House Manager", role: "MANAGER" },
    { email: "coordinator@example.com", name: "Coordinator", role: "COORDINATOR" },
    { email: "driver@example.com", name: "Driver", role: "DRIVER" },
    { email: "public@example.com", name: "Public User", role: "PUBLIC" },
  ];

  for (const r of roles) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        name: r.name,
        password, // hashed password
        role: r.role,
        isApproved: true,
      },
    });
  }

  console.log("✅ Seed complete: Users created with all roles");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });