import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  BookOpenCheck,
  LayoutDashboard,
  Users,
  ChevronDown,
  Download,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/actions/auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { sidebarMenuButtonVariants } from '@/components/ui/sidebar-variants';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
    { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Kursus' },
    { href: '/dashboard/downloads', icon: Download, label: 'Unduhan' },
    { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
  ];

  const adminNavItems = [
    { href: '/dashboard/admin', label: 'Pengguna' },
    { href: '/dashboard/admin/course-settings', label: 'Pengaturan Kursus' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpenCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Aplikasi Saya</span>
          </div>
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
            {user?.role === 'admin' && (
              <Collapsible className="w-full">
                <CollapsibleTrigger asChild>
                  <div
                    role="button"
                    className={cn(
                      sidebarMenuButtonVariants(),
                      'w-full justify-between'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Users />
                      <span>Admin</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {adminNavItems.map((item) => (
                      <SidebarMenuSubItem key={item.label}>
                        <Link href={item.href}>
                           <SidebarMenuButton size="sm" type="button" className="w-full">
                              {item.label}
                           </SidebarMenuButton>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            )}
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
