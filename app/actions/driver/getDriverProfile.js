"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";


export async function getDriverProfile() {
  const session = await getServerSession(authOptions);
  
  
    if (!session?.user?.id) return null;
  

  const driver = await prisma.driver.findUnique({
    where: { userId: session.user.id },
  });

  return driver;
}