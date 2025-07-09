
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  BookOpenCheck,
  LayoutDashboard,
  Users,
  Download,
  Settings,
  FolderKanban,
  GraduationCap,
  Loader2,
  AppWindow,
  Sparkles,
  Gem,
  LayoutTemplate,
  Award,
  FileClock,
  ToggleRight,
  DollarSign,
  Rocket,
  BookUser,
  Library,
  Palette,
  Banknote,
  BookOpen,
  KeyRound,
  Building,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSeoSettings } from '@/actions/settings';
import { ReferredByBadge } from '@/components/referred-by-badge';

// Define navigation items as constants for clarity and reliability
const superAdminNavItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dasbor Admin' },
  { href: '/dashboard/admin/tenants', icon: Building, label: 'Manajemen Tenant' },
  { href: '/dashboard/admin/courses', icon: FolderKanban, label: 'Manajemen Kursus' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Manajemen Pengguna' },
  { href: '/dashboard/admin/course-review', icon: BookOpen, label: 'Tinjauan Kursus'},
  { href: '/dashboard/admin/instructor-requests', icon: BookUser, label: 'Permintaan Pengajar'},
  { href: '/dashboard/admin/reseller-requests', icon: Store, label: 'Permintaan Reseller'},
  { href: '/dashboard/admin/pro-requests', icon: Gem, label: 'Permintaan Pro' },
  { href: '/dashboard/admin/certificate-requests', icon: FileClock, label: 'Permintaan Sertifikat' },
  { href: '/dashboard/admin/custom-app-requests', icon: Rocket, label: 'Request Aplikasi' },
  { href: '/dashboard/admin/affiliate-management', icon: DollarSign, label: 'Manajemen Afiliasi' },
  { href: '/dashboard/admin/withdrawal-requests', icon: Banknote, label: 'Permintaan Penarikan' },
  { href: '/dashboard/admin/api-tokens', icon: KeyRound, label: 'API Token' },
  { href: '/dashboard/admin/certificate-management', icon: Download, label: 'Manajemen Unduhan' },
  { href: '/dashboard/admin/app-settings', icon: ToggleRight, label: 'Pengaturan Aplikasi' },
  { href: '/dashboard/admin/landing-page-settings', icon: LayoutTemplate, label: 'Halaman Depan' },
  { href: '/dashboard/admin/course-settings', icon: Settings, label: 'Pengaturan Global' },
];

const tenantAdminNavItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dasbor Admin' },
  { href: '/dashboard/admin/courses', icon: FolderKanban, label: 'Manajemen Kursus' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Manajemen Pengguna' },
  { href: '/dashboard/admin/course-review', icon: BookOpen, label: 'Tinjauan Kursus'},
  { href: '/dashboard/admin/instructor-requests', icon: BookUser, label: 'Permintaan Pengajar'},
  { href: '/dashboard/admin/pro-requests', icon: Gem, label: 'Permintaan Pro' },
  { href: '/dashboard/admin/certificate-requests', icon: FileClock, label: 'Permintaan Sertifikat' },
  { href: '/dashboard/admin/custom-app-requests', icon: Rocket, label: 'Request Aplikasi' },
  { href: '/dashboard/admin/affiliate-management', icon: DollarSign, label: 'Manajemen Afiliasi' },
  { href: '/dashboard/admin/withdrawal-requests', icon: Banknote, label: 'Permintaan Penarikan' },
  { href: '/dashboard/admin/certificate-management', icon: Download, label: 'Manajemen Unduhan' },
  { href: '/dashboard/admin/app-settings', icon: ToggleRight, label: 'Pengaturan Aplikasi' },
  { href: '/dashboard/admin/tenant-settings', icon: Palette, label: 'Branding & Domain' },
  { href: '/dashboard/admin/landing-page-settings', icon: LayoutTemplate, label: 'Halaman Depan' },
  { href: '/dashboard/admin/course-settings', icon: Settings, label: 'Pengaturan Global' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [platformName, setPlatformName] = useState('Aplikasi Saya');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Pastikan hanya admin yang bisa mengakses layout ini
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchSettings() {
      const settings = await getSeoSettings();
      if (settings && settings.platformName) {
          setPlatformName(settings.platformName);
      }
    }
    fetchSettings();
  }, []);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const navItems = user.tenant_id === 'platform_main' ? superAdminNavItems : tenantAdminNavItems;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpenCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">{platformName}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild type="button" tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-svh">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <footer className="flex justify-center p-4 border-t shrink-0">
            {user && user.referredBy && user.role !== 'instructor' && <ReferredByBadge referralCode={user.referredBy} />}
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
