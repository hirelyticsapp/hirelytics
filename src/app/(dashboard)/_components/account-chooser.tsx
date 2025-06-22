'use client';
import { UserIcon, UserSearchIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { AuthCard } from '@/components/ui/auth-card';
import { Button } from '@/components/ui/button';
import { RadialGradientBackground } from '@/components/ui/radial-gradient-background';
import { cn } from '@/lib/utils';

export default function AccountChooser() {
  return (
    <RadialGradientBackground>
      <div className="flex w-full max-w-md flex-col gap-8">
        {/* Logo section */}
        <div className="text-center">
          <Image
            src="/images/hirelytics-full-logo.svg"
            alt="Hirelytics Mission"
            width={200}
            height={180}
            className="mx-auto"
          />
        </div>

        <div className={cn('flex flex-col gap-6')}>
          <AuthCard title="Welcome back" description="Choose your login option to continue">
            <div className="grid gap-4">
              <div className="flex flex-col gap-4">
                <Link href="/login">
                  <Button
                    variant="default"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-white"
                  >
                    <UserIcon className="size-5 mr-2" />
                    Login as Candidate
                  </Button>
                </Link>
                <Link href="/recruiter/login">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <UserSearchIcon className="size-5 mr-2" />
                    Login as Recruiter
                  </Button>
                </Link>
              </div>
            </div>
          </AuthCard>
        </div>
      </div>
    </RadialGradientBackground>
  );
}
