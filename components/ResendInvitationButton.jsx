"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * ResendInvitationButton
 * 
 * Button to resend invitation email to a user
 * Can be used in admin dashboard (for coordinators) or coordinator dashboard (for managers)
 * 
 * Props:
 * - userId: ID of user to resend invitation to
 * - userEmail: Email of user (for display in toast)
 * - userName: Name of user (optional, for display)
 * - size: Button size (default: "sm")
 * - variant: Button variant (default: "outline")
 */
export default function ResendInvitationButton({
  userId,
  userEmail,
  userName,
  size = "sm",
  variant = "outline",
}) {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);

    try {
      const res = await fetch("/api/resend-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Invitation email resent to ${userName || userEmail}`, {
          description: "They should receive it within a few minutes",
        });
      } else {
        toast.error(data.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleResend}
      disabled={sending}
      className="gap-2"
    >
      {sending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          Resend Invitation
        </>
      )}
    </Button>
  );
}