
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
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSeoSettings } from '@/actions/settings';
import { ReferredByBadge } from '@/components/referred-by-badge';

// Define navigation items as constants for clarity and reliability
const adminNavItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dasbor Admin' },
  { href: '/dashboard/admin/courses', icon: FolderKanban, label: 'Manajemen Kursus' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Manajemen Pengguna' },
  { href: '/dashboard/admin/course-review', icon: BookOpen, label: 'Tinjauan Kursus'},
  { href: '/dashboard/admin/instructor-requests', icon: BookUser, label: 'Permintaan Pengajar'},
  { href: '/dashboard/admin/pro-requests', icon: Gem, label: 'Permintaan Pro' },
  { href: '/dashboard/admin/certificate-requests', icon: FileClock, label: 'Permintaan Sertifikat' },
  { href: '/dashboard/admin/custom-app-requests', icon: Rocket, label: 'Request Aplikasi' },
  { href: '/dashboard/admin/certificate-management', icon: Download, label: 'Manajemen Unduhan' },
  { href: '/dashboard/admin/affiliate-management', icon: DollarSign, label: 'Manajemen Afiliasi' },
  { href: '/dashboard/admin/withdrawal-requests', icon: Banknote, label: 'Penarikan Dana' },
  { href: '/dashboard/admin/app-settings', icon: ToggleRight, label: 'Pengaturan Aplikasi' },
  { href: '/dashboard/admin/landing-page-settings', icon: LayoutTemplate, label: 'Halaman Depan' },
  { href: '/dashboard/admin/course-settings', icon: Settings, label: 'Pengaturan Global' },
];

const instructorNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
  { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Katalog Kursus' },
  { href: '/dashboard/aplikasi', icon: AppWindow, label: 'Aplikasi AI' },
  { href: '/dashboard/my-courses', icon: GraduationCap, label: 'Kursus Saya' },
  { href: '/dashboard/my-certificates', icon: Award, label: 'Sertifikat Saya' },
  { href: '/dashboard/affiliate', icon: DollarSign, label: 'Afiliasi' },
  { href: '/dashboard/downloads', icon: Download, label: 'Unduhan' },
  { href: '/dashboard/custom-app-request', icon: Rocket, label: 'Request Aplikasi' },
  { href: '/dashboard/instructor/courses', icon: Library, label: 'Konten Saya' },
  { href: '/dashboard/instructor/branding', icon: Palette, label: 'Pengaturan Merek' },
  { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
];

const proNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
  { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Katalog Kursus' },
  { href: '/dashboard/aplikasi', icon: AppWindow, label: 'Aplikasi AI' },
  { href: '/dashboard/my-courses', icon: GraduationCap, label: 'Kursus Saya' },
  { href: '/dashboard/my-certificates', icon: Award, label: 'Sertifikat Saya' },
  { href: '/dashboard/affiliate', icon: DollarSign, label: 'Afiliasi' },
  { href: '/dashboard/downloads', icon: Download, label: 'Unduhan' },
  { href: '/dashboard/custom-app-request', icon: Rocket, label: 'Request Aplikasi' },
  { href: '/dashboard/instructor/apply', icon: BookUser, label: 'Jadi Pengajar' },
  { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
];

const memberNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
  { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Katalog Kursus' },
  { href: '/dashboard/aplikasi', icon: AppWindow, label: 'Aplikasi AI' },
  { href: '/dashboard/my-courses', icon: GraduationCap, label: 'Kursus Saya' },
  { href: '/dashboard/my-certificates', icon: Award, label: 'Sertifikat Saya' },
  { href: '/dashboard/affiliate', icon: DollarSign, label: 'Afiliasi' },
  { href: '/dashboard/upgrade', icon: Sparkles, label: 'Upgrade ke Pro' },
  { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
];

const defaultNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
  { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Katalog Kursus' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [platformName, setPlatformName] = useState('Aplikasi Saya');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return adminNavItems;
      case 'instructor':
        return instructorNavItems;
      case 'pro':
        return proNavItems;
      case 'member':
        return memberNavItems;
      default:
        return defaultNavItems;
    }
  };

  const navItems = getNavItems();

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
