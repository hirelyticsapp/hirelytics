'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    if (!path || path === 'console') return 'Dashboard';
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium text-foreground">{getPageTitle()}</h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Organization Switcher for Admin and Recruiter */}

          {/* Theme Toggle */}
          {mounted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              className="gap-2"
            >
              {resolvedTheme === 'light' ? (
                <>
                  <IconMoon className="size-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <IconSun className="size-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 w-[93px]">
              <span className="size-4" /> {/* Placeholder with same size */}
              <span className="hidden sm:inline opacity-0">Theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
