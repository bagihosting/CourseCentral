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

export function RelativeTime({ date, fallback = '...' }: RelativeTimeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted
    setIsClient(true);
  }, []);

  if (!date) {
    return <span>{fallback}</span>;
  }
  
  // More robust date validation
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    // If date is invalid, return fallback
    return <span>{fallback}</span>;
  }

  // To prevent hydration errors, we ensure that the initial render on the client
  // is exactly the same as the server-rendered output. We only render the
  // dynamic relative time after the component has safely mounted on the client.
  if (!isClient) {
    // Render the fallback on the server and initial client render
    // This guarantees no mismatch. The full date is available in the title attribute.
    return <span title={dateObj.toISOString()}>{fallback}</span>;
  }

  // After mounting on the client, we can safely render the dynamic relative time.
  try {
    return (
      <span title={dateObj.toLocaleString('id-ID')}>
        {formatDistanceToNow(dateObj, { addSuffix: true, locale: id })}
      </span>
    );
  } catch (e) {
    // In case of an invalid date format passed from the database
    return <span>{fallback}</span>;
  }
}
