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
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSeoSettings } from '@/lib/data';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [platformName, setPlatformName] = useState('Aplikasi Saya');

  const memberNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
    { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Katalog Kursus' },
    { href: '/dashboard/aplikasi', icon: AppWindow, label: 'Aplikasi' },
    { href: '/dashboard/my-courses', icon: GraduationCap, label: 'Kursus Saya' },
    { href: '/dashboard/my-certificates', icon: Award, label: 'Sertifikat Saya' },
    { href: '/dashboard/upgrade', icon: Sparkles, label: 'Upgrade ke Pro' },
    { href: '/dashboard/downloads', icon: Download, label: 'Unduhan' },
    { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
  ];
  
  const adminNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
    { href: '/dashboard/admin/courses', icon: FolderKanban, label: 'Manajemen Kursus' },
    { href: '/dashboard/admin', icon: Users, label: 'Pengguna' },
    { href: '/dashboard/admin/pro-requests', icon: Gem, label: 'Permintaan Pro' },
    { href: '/dashboard/admin/certificate-requests', icon: FileClock, label: 'Permintaan Sertifikat' },
    { href: '/dashboard/admin/certificate-management', icon: Award, label: 'Generator Sertifikat' },
    { href: '/dashboard/aplikasi', icon: AppWindow, label: 'Aplikasi' },
    { href: '/dashboard/downloads', icon: Download, label: 'Unduhan' },
    { href: '/dashboard/admin/landing-page-settings', icon: LayoutTemplate, label: 'Halaman Depan' },
    { href: '/dashboard/admin/course-settings', icon: Settings, label: 'Pengaturan Global' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const settings = getSeoSettings();
    if (settings && settings.platformName) {
        setPlatformName(settings.platformName);
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const getNavItems = () => {
      if (user.role === 'admin') {
        return adminNavItems;
      }
      return memberNavItems.filter(item => {
        if (item.label === 'Upgrade ke Pro') {
          return user.role === 'member'; // Only show for regular members
        }
        if (item.label === 'Unduhan') {
          return user.role === 'pro'; // Only show for pro members
        }
        return true;
      });
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
              <SidebarMenuItem key={item.label}>
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
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
