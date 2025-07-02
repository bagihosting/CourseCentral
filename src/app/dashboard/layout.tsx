import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { getUserById } from '@/lib/data';
import {
  BookOpenCheck,
  LayoutDashboard,
  Download,
  Settings,
  UserCog,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // In a real app, you would get the user from session/auth
  const user = await getUserById('user-2');

  if (!user) {
    return <div>User not found</div>;
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/courses', icon: BookOpenCheck, label: 'Courses' },
    { href: '/dashboard/downloads', icon: Download, label: 'Downloads' },
  ];

  const adminNavItems = [{ href: '/dashboard/admin', icon: UserCog, label: 'Admin' }];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpenCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">CourseCentral</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            {user.role === 'admin' && (
              <Collapsible className="w-full">
                <CollapsibleTrigger className="w-full">
                  <SidebarMenuButton className="justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog />
                      <span>Admin</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {adminNavItems.map((item) => (
                      <SidebarMenuSubItem key={item.label}>
                          <Link href={item.href} className="w-full">
                            <SidebarMenuSubButton>{item.label}</SidebarMenuSubButton>
                          </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/settings" className="w-full">
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
