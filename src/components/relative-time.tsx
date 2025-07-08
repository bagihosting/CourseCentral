'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface RelativeTimeProps {
  /** The date to format, as an ISO string or object that can be passed to `new Date()` */
  date: string | null | undefined;
  /** The text to display as a fallback or before client-side hydration */
  fallback?: string;
}

export function RelativeTime({ date, fallback = '...' }: RelativeTimeProps) {
  const [displayText, setDisplayText] = useState(fallback);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    if (date) {
      try {
        const dateObj = new Date(date);
        // Ensure date is valid before trying to format
        if (!isNaN(dateObj.getTime())) {
          setDisplayText(formatDistanceToNow(dateObj, { addSuffix: true, locale: id }));
        }
      } catch (e) {
        // If parsing fails, it remains the fallback text.
        console.error("Failed to parse date for RelativeTime:", date);
      }
    }
  }, [date, fallback]); // Re-run effect if date prop changes.

  // The server renders the fallback.
  // The client's *initial* render also renders the fallback.
  // The `useEffect` then updates the state, causing a re-render on the client with the dynamic time.
  // This is a safe and standard pattern to avoid hydration errors.
  return (
    <span title={date || 'Invalid date'}>
      {displayText}
    </span>
  );
}
