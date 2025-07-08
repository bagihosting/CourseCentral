
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  // `formattedDate` starts as null and is only set on the client after mounting.
  // This ensures the server-rendered output and the initial client render are identical.
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client side, after the component has mounted.
    if (!date) {
      setFormattedDate(fallback);
      return;
    }
    try {
      const dateObj = new Date(date);
      // Validate the date object
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date provided to RelativeTime component: ${date}`);
        setFormattedDate(fallback);
        return;
      }
      
      // Calculate the relative time string and update the state.
      const relative = formatDistanceToNow(dateObj, { addSuffix: true, locale: id });
      setFormattedDate(relative);
    } catch (error) {
      console.error("Error formatting date in RelativeTime component:", error);
      setFormattedDate(fallback);
    }
  }, [date, fallback]);

  // Use `useMemo` to calculate the full date tooltip. This is safe because it runs
  // after the initial render and uses the stable `date` prop.
  const fullDateTitle = useMemo(() => {
    if (!date) return "Tanggal tidak tersedia";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return `Tanggal tidak valid: ${date}`;
      return format(dateObj, "d MMMM yyyy, HH:mm", { locale: id });
    } catch {
      return "Error memformat tanggal";
    }
  }, [date]);

  // On the server, and on the very first client render, `formattedDate` is `null`.
  // We render the fallback text directly, ensuring no mismatch.
  if (formattedDate === null) {
    return <span title="Memuat waktu...">{fallback}</span>;
  }
  
  // After hydration and the `useEffect` runs, the state is updated,
  // and the component re-renders with the calculated relative time.
  return (
    <span title={fullDateTitle}>
      {formattedDate}
    </span>
  );
}
