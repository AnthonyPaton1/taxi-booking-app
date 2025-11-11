// lib/hooks/useSessionTimeout.js
"use client";

import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * Session timeout hook - auto-logout after 30 minutes of inactivity
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 */
export function useSessionTimeout(timeoutMinutes = 30) {
  const timeoutRef = useRef(null);
  const pathname = usePathname();
  const TIMEOUT_MS = timeoutMinutes * 60 * 1000; // Convert to milliseconds

  const resetTimeout = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ Session timeout - logging out due to inactivity');
      signOut({ 
        callbackUrl: '/login?timeout=true',
        redirect: true 
      });
    }, TIMEOUT_MS);
  }, [TIMEOUT_MS]);

  useEffect(() => {
    // Don't run on public pages
    const publicPages = ['/login', '/signup', '/'];
    if (publicPages.includes(pathname)) {
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timeout on any user activity
    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname, resetTimeout]);
}