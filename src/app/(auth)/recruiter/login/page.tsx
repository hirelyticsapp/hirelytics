import { BarChart3, Target, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';

import { RadialGradientBackground } from '@/components/ui/radial-gradient-background';

import { RecruiterLoginForm } from './_components/recruiter-login-form';

export default function RecruiterLoginPage() {
  return (
    <RadialGradientBackground>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Login form */}
        <div className="flex flex-col items-center justify-center space-y-8 order-2 lg:order-1">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Recruiter Portal</h1>
          </div>

          {/* Login form wrapper */}
          <div className="w-full max-w-md">
            <Suspense fallback={<div>Loading...</div>}>
              <RecruiterLoginForm />
            </Suspense>
          </div>

          {/* Additional info for mobile */}
          <div className="lg:hidden text-center space-y-3 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Access powerful AI-driven recruitment tools and analytics
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Efficient
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Precise
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Scalable
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>

        {/* Right side - Recruiter focused branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 px-6 order-1 lg:order-2">
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
              Hire Smarter, Not Harder
            </h2>
            <p className="text-md text-muted-foreground font-medium leading-relaxed">
              Transform your recruitment process with AI-driven insights. Identify top talent faster
              while reducing bias and improving hiring quality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">70% Faster Hiring</span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Advanced Analytics</span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Team Collaboration</span>
            </div>
          </div>

          {/* Success indicators */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>500+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
              <span>98% Hiring Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </RadialGradientBackground>
  );
}
