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
export function RelativeTime({ date, fallback = '...' }: RelativeTimeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  // On the server or during the initial client render, `isClient` is false.
  // We render a simple, static fallback to ensure server and client HTML match.
  if (!isClient) {
    return <span title="Memuat waktu...">{fallback}</span>;
  }

  // From this point on, the code only runs on the client side.
  if (!date) {
    return <span title="Tanggal tidak tersedia">{fallback}</span>;
  }

  try {
    const dateObj = new Date(date);
    // Validate the date object
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date provided to RelativeTime component: ${date}`);
      return <span title={`Tanggal tidak valid: ${date}`}>{fallback}</span>;
    }
    
    // Format the date into a relative string (e.g., "5 menit yang lalu")
    const formattedRelativeDate = formatDistanceToNow(dateObj, { addSuffix: true, locale: id });
    // Format the date into a full string for the tooltip (e.g., "25 Agustus 2024 10:30")
    const formattedFullDate = format(dateObj, "d MMMM yyyy, HH:mm", { locale: id });

    return (
      <span title={formattedFullDate}>
        {formattedRelativeDate}
      </span>
    );
  } catch (error) {
    console.error("Error formatting date in RelativeTime component:", error);
    return <span title={`Error memformat tanggal: ${date}`}>{fallback}</span>;
  }
}
