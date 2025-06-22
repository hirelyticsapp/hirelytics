import Image from 'next/image';
import { Suspense } from 'react';

import { RadialGradientBackground } from '@/components/ui/radial-gradient-background';

import { RequestAccessRequestForm } from './_components/request-access-form';

export default function RecruiterRequestAccessPage() {
  return (
    <RadialGradientBackground>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/images/hirelytics-full-logo.svg"
              alt="Hirelytics"
              width={160}
              height={40}
              className="mx-auto"
            />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground">Join Leading Companies</h1>
            <p className="text-lg text-muted-foreground">
              Transform your hiring process with AI-driven insights. Request access to our
              enterprise recruitment platform.
            </p>
          </div>
        </div>

        {/* Request access form */}
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <RequestAccessRequestForm />
          </Suspense>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Fortune 500 Trusted
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Enterprise Security
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              24/7 Support
            </span>
          </div>

          <div className="text-muted-foreground text-center text-xs text-balance">
            By submitting this request, you agree to our{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </RadialGradientBackground>
  );
}
