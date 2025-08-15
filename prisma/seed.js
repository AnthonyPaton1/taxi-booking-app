import { prisma } from "../lib/db.js";

async function main() {
  // minimal seed: a manager + a driver
  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: { email: "manager@example.com", role: "MANAGER", name: "Boss" },
  });

  await prisma.user.upsert({
    where: { email: "driver@example.com" },
    update: {},
    create: {
      email: "driver@example.com",
      role: "DRIVER",
      name: "Dan Driver",
      managerId: manager.id,
    },
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
