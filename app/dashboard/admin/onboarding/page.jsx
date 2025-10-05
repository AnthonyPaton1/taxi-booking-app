//app/dashboard/admin/onboarding.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import BusinessOnboardingForm from "@/components/forms/business/BusinessOnboardingForm";

export default async function AdminOnboardingPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email,
    },
    include: {
      business: true
    },
  });

  return (
    <BusinessOnboardingForm
      prefillData={{
  businessName: user?.business?.name || "",
  contactEmail: user?.email || "",
  contactNumber: user?.phone || "",
  name: user?.name || "",
  type: user?.role || "",
  address1: user?.business?.address1 || "",
  city: user?.business?.city || "",
  postcode: user?.business?.postcode || "",
  website: user?.business?.website || "",
}}
    />
  );
}