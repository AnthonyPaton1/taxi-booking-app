// app/reset-password/page.jsx
"use client";

import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center">Loading reset form...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}