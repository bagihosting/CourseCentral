
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompletedCourseCount } from '@/actions/enrollments';
import { getRank } from '@/lib/ranks';
import { RankBadge } from './rank-badge';

export function UserNav() {
  const { user, logout } = useAuth();
  const [completedCourses, setCompletedCourses] = useState(0);

  useEffect(() => {
    async function fetchCompletedCount() {
      if (user && (user.role === 'member' || user.role === 'pro')) {
        const count = await getCompletedCourseCount(user.id);
        setCompletedCourses(count);
      }
    }
    fetchCompletedCount();
  }, [user]);

  if (!user) {
    return null;
  }

  const rank = getRank(completedCourses, user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex flex-col items-center gap-2 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              <UserIcon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {user.username}
            </p>
          </div>
          <RankBadge rank={rank} />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard/settings">
            <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button onClick={() => logout()} className="w-full text-left cursor-pointer flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    