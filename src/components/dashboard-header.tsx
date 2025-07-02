import { SidebarTrigger } from '@/components/ui/sidebar';
import type { User } from '@/types';
import { UserNav } from './user-nav';

type DashboardHeaderProps = {
  user: User;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex w-full items-center justify-end">
        <UserNav user={user} />
      </div>
    </header>
  );
}
