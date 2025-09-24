
import { Suspense } from "react";
import SetPasswordClient from "@/components/set-password/setPasswordClient";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordClient />
    </Suspense>
  );
}