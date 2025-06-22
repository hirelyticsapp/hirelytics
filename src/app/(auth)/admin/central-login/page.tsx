import { Brain, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { RadialGradientBackground } from '@/components/ui/radial-gradient-background';

import CentralLoginForm from './_component/login-form';

export default function CentralLoginPage() {
  return (
    <RadialGradientBackground>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
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
              Next-Generation Interview Platform
            </h2>
            <p className="text-md text-muted-foreground font-medium leading-relaxed">
              Experience the future of hiring with AI-powered interviews that are fair, efficient,
              and insightful. Transform your recruitment process today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">
                AI-Powered Assessment
              </span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Smart Analytics</span>
            </div>

            <div className="group flex items-center gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Real-time Feedback</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI Interview</h1>
          </div>

          {/* Login form with enhanced styling */}
          <div className="w-full max-w-md">
            <CentralLoginForm />
          </div>

          {/* Additional info for mobile */}
          <div className="lg:hidden text-center space-y-3 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Secure authentication powered by advanced AI technology
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Encrypted
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Verified
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Trusted
              </span>
            </div>
          </div>
        </div>
      </div>
    </RadialGradientBackground>
  );
}
