
'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface RelativeTimeProps {
  /** The date to format, as an ISO string or object that can be passed to `new Date()` */
  date: string | null | undefined;
  /** The text to display as a fallback or before client-side hydration */
  fallback?: string;
}

/**
 * A client-side component that safely renders a relative time string (e.g., "5 menit yang lalu").
 * It avoids hydration errors by rendering a fallback on the server and initial client render,
 * then switching to the dynamic time on the client after hydration.
 */
export function RelativeTime({ date, fallback = '-' }: RelativeTimeProps) {
  // `isMounted` will be false on the server and on the first client render.
  // It becomes true only after the component has mounted on the client.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side, after the component has mounted.
    setIsMounted(true);
  }, []);

  // If the component hasn't mounted yet (i.e., we're on the server or in the first client render),
  // we render the simple, static fallback. This guarantees no hydration mismatch.
  if (!isMounted || !date) {
    return <span title={!isMounted ? "Memuat waktu..." : "Tanggal tidak tersedia"}>{fallback}</span>;
  }

  // Once mounted, we can safely perform date calculations because we are guaranteed to be on the client.
  let dateObj;
  try {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }
  } catch (error) {
    console.warn(`Invalid date provided to RelativeTime component: ${date}`);
    return <span title={`Tanggal tidak valid: ${date}`}>{fallback}</span>;
  }
  
  const fullDateTitle = format(dateObj, "d MMMM yyyy, HH:mm", { locale: id });
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true, locale: id });
  
  // Render the fully calculated, dynamic time.
  return (
    <span title={fullDateTitle}>
      {relativeTime}
    </span>
  );
}
