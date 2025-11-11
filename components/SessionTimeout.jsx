// components/SessionTimeout.jsx
"use client";

import { useSession } from 'next-auth/react';
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout';

/**
 * SessionTimeout component - monitors user activity and logs out after 30 minutes of inactivity
 * Add this component to your root layout (app/layout.js) inside the SessionProvider
 */
export default function SessionTimeout() {
  const { data: session } = useSession();
  
  // Only activate timeout if user is logged in
  if (session?.user) {
    useSessionTimeout(30); // 30 minutes of inactivity
  }

  return null; // This component doesn't render anything
}