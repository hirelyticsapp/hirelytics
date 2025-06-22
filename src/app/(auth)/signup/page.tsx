import { Clock, Shield, Star, Users } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';

import { RadialGradientBackground } from '@/components/ui/radial-gradient-background';

import { SignupWrapper } from './_components/signup-wrapper';

export default function SignupPage() {
  return (
    <RadialGradientBackground>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Candidate focused branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 px-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <Image
              src="/images/hirelytics-full-logo.svg"
              alt="Hirelytics Mission"
              width={200}
              height={180}
              className="mx-auto mb-4"
            />
          </a>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-3xl font-semibold text-primary leading-tight">
              Start Your Journey Today
            </h2>
            <p className="text-md text-muted-foreground font-medium leading-relaxed">
              Join thousands of candidates who have discovered their dream jobs through our
              AI-powered interview platform. Your next opportunity awaits.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">
                Quick 15-min Interviews
              </span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">
                Fair & Unbiased Process
              </span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Instant Feedback</span>
            </div>
          </div>

          {/* Success indicators */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>50K+ Candidates Hired</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Join Hirelytics</h1>
          </div>

          {/* Signup form wrapper */}
          <div className="w-full max-w-md">
            <Suspense fallback={<div>Loading...</div>}>
              <SignupWrapper />
            </Suspense>
          </div>

          {/* Additional info for mobile */}
          <div className="lg:hidden text-center space-y-3 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Start your journey to finding the perfect job with AI-powered interviews
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Quick
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Fair
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Effective
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </RadialGradientBackground>
  );
}
