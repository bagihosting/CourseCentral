
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getReferredUsers, PopulatedReferredUser } from '@/actions/affiliate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Copy, CheckCircle, Users, Link as LinkIcon, Gift, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { AffiliatePromoKit } from '@/components/affiliate-promo-kit';
import { ReferredByBadge } from '@/components/referred-by-badge';

export default function AffiliatePage() {
  const { user, loading: userLoading } = useAuth();
  const [referredUsers, setReferredUsers] = useState<PopulatedReferredUser[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
        if (user) {
            const users = await getReferredUsers(user.id);
            setReferredUsers(users);
            setReferralLink(`${window.location.origin}/login?ref=${user.referralCode}`);
        }
        setLoading(false);
    }
    fetchData();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({ title: 'Tersalin!', description: 'Link referral Anda telah disalin ke clipboard.' });
    }).catch(err => {
      toast({ title: 'Gagal', description: 'Gagal menyalin link.', variant: 'destructive' });
    });
  };
  
  const stats = useMemo(() => {
    const successfulReferrals = referredUsers.filter(u => u.role === 'pro').length;
    return {
      totalReferrals: referredUsers.length,
      successfulReferrals,
      balance: user?.affiliateBalance || 0,
      totalPaid: user?.affiliatePaid || 0,
    };
  }, [referredUsers, user]);

  if (loading || userLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isEligibleForFreePro = user.role === 'member' && stats.successfulReferrals < 5;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dasbor Afiliasi</h1>
        <p className="text-muted-foreground">Lacak referral Anda, lihat penghasilan, dan bagikan link unik Anda.</p>
        {user.referredBy && user.role !== 'instructor' && (
            <div className="mt-4">
                 <ReferredByBadge referralCode={user.referredBy} />
            </div>
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon/> Link Referral Unik Anda</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4" />Salin</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Bagikan link ini. Setiap pengguna yang mendaftar dan upgrade ke Pro akan dihitung sebagai referral Anda.</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referral</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Total pengguna yang mendaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Sukses (Pro)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulReferrals}</div>
            <p className="text-xs text-muted-foreground">Total pengguna yang upgrade ke Pro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi (Belum Dibayar)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{stats.balance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Total dibayar: Rp{stats.totalPaid.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
      </div>

      {isEligibleForFreePro && (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift/> Dapatkan Akses Pro Gratis!</CardTitle>
                <CardDescription>Referensikan 5 teman untuk upgrade ke Pro dan dapatkan akun Pro Anda secara gratis, seumur hidup!</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={(stats.successfulReferrals / 5) * 100} className="w-full" />
                <p className="text-sm text-center mt-2 font-medium">{stats.successfulReferrals} dari 5 referral sukses</p>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wand2/> Alat Promosi Afiliasi AI</CardTitle>
            <CardDescription>Gunakan AI untuk membuat gambar dan teks promosi yang menarik, lengkap dengan link referral Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            <AffiliatePromoKit referralLink={referralLink} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Daftar Pengguna yang Anda Referensikan</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Pengguna</TableHead>
                        <TableHead>Tanggal Bergabung</TableHead>
                        <TableHead>Status Akun</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {referredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            Anda belum memiliki referral.
                        </TableCell>
                    </TableRow>
                ) : (
                    referredUsers.map((refUser) => (
                        <TableRow key={refUser.id}>
                            <TableCell className="font-medium">{refUser.name}</TableCell>
                            <TableCell>{format(new Date(refUser.createdAt), 'dd MMMM yyyy', { locale: id })}</TableCell>
                            <TableCell>
                                {refUser.role === 'pro' ? (
                                    <Badge variant="default" className="bg-violet-500 hover:bg-violet-600">Pro</Badge>
                                ) : (
                                    <Badge variant="secondary">Member</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
