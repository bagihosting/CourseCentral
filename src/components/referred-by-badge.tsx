'use client';

import { useState, useEffect } from 'react';
import { getUserByReferralCode } from '@/actions/users';
import { Gift } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function ReferredByBadge({ referralCode }: { referralCode: string | null | undefined }) {
    const [referrerName, setReferrerName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReferrer() {
            if (referralCode) {
                try {
                    const referrer = await getUserByReferralCode(referralCode);
                    if (referrer) {
                        setReferrerName(referrer.name);
                    }
                } catch (error) {
                    // Fail silently, it's not a critical feature
                    console.error("Failed to fetch referrer", error);
                }
            }
            setLoading(false);
        }
        fetchReferrer();
    }, [referralCode]);

    if (!referralCode) {
        return null;
    }
    
    if (loading) {
        return <Skeleton className="h-7 w-48 rounded-full" />;
    }

    if (!referrerName) {
        return null;
    }

    return (
        <div className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <div className="absolute -inset-0.5 animate-pulse-slow rounded-full bg-primary/20 opacity-75 blur-sm group-hover:animate-none"></div>
            <Gift className="relative h-4 w-4" />
            <span className="relative">Diajak oleh: <strong>{referrerName}</strong></span>
        </div>
    );
}
