
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted
    setIsMounted(true);
  }, []);

  if (!date) {
    return <span>{fallback}</span>;
  }

  // On the server, and on the initial client render, `isMounted` will be `false`.
  // We return a static, non-relative date format to ensure consistency and prevent mismatch.
  if (!isMounted) {
    try {
        return <span title={new Date(date).toISOString()}>{format(new Date(date), 'dd MMM yyyy', { locale: id })}</span>;
    } catch (e) {
        return <span>{fallback}</span>;
    }
  }

  // After mounting on the client, we can safely render the dynamic relative time.
  try {
    return (
      <span title={new Date(date).toLocaleString('id-ID')}>
        {formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })}
      </span>
    );
  } catch (e) {
    // In case of an invalid date format passed from the database
    return <span>{fallback}</span>;
  }
}
