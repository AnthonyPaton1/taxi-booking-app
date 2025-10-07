'use client'
import { useEffect } from "react";
import { Suspense } from "react";
import SetPasswordClient from "@/components/set-password/setPasswordClient";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function SetPasswordPage() {
const router = useRouter();

useEffect(() => {
  const checkUserRole = async () => {
    const session = await getSession();
    const role = session?.user?.role;

    if (role === "DRIVER") {
      router.push("/dashboard/driver");
    } else if (role === "ADMIN" || role === "COMPANY_ADMIN") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard"); 
    }
  };

  checkUserRole();
}, [router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordClient />
    </Suspense>
  );
}