'use client';

import {
  IconBasketQuestion,
  IconBriefcase,
  IconBuilding,
  IconDashboard,
  IconUsers,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

import { NavUser } from './nav-user';

const navigation = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: IconDashboard,
        color: 'text-blue-500',
      },
      {
        title: 'Organizations',
        url: '/organizations',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'Candidates',
        url: '/candidates',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
      {
        title: 'Recruiters',
        url: '/recruiters',
        icon: IconUsers,
        color: 'text-teal-500',
      },
      {
        title: 'Jobs',
        url: '/jobs',
        icon: IconBriefcase,
        color: 'text-orange-500',
      },
      {
        title: 'Portal Access Requests',
        url: '/portal-access-requests',
        icon: IconBasketQuestion,
        color: 'text-orange-500',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActiveItem = (url: string) => {
    if (url === '/') {
      return pathname === '/' || pathname === '/';
    }
    return pathname.startsWith(`/${url}`);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/console">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/hirelytics-logo.svg"
                    alt="Hirelytics"
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{'Hirelytics'}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role} Portal
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group, index) => (
          <SidebarGroup key={index}>
            {group.title && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isActiveItem(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`group relative overflow-hidden transition-all duration-200 px-1 py-3 ${
                          isActive
                            ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <Link href={`${item.url}`}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-md transition-colors ${
                                isActive
                                  ? `bg-primary/20 ${item.color || 'text-primary'}`
                                  : `bg-background/50 ${item.color || 'text-muted-foreground'}`
                              }`}
                            >
                              <item.icon className="size-4" />
                            </div>
                            <span
                              className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}
                            >
                              {item.title}
                            </span>
                          </div>
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/15" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
