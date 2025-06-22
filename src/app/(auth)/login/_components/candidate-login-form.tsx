'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { GoogleIcon, MicrosoftIcon } from '@/components/icons';
import { AuthCard } from '@/components/ui/auth-card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function CandidateLoginForm() {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();

  // tRPC mutations

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Determine loading states
  const isEmailLoading = false;
  const isOtpLoading = isAuthLoading;
  const isAnyLoading = isEmailLoading || isOtpLoading;

  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      setUserEmail(data.email);
      setIsOtpStep(true);
    } catch (error) {
      console.error('Email submission failed:', error);
    }
  };

  const handleOtpSubmit = async (_data: OtpFormData) => {
    setIsAuthLoading(true);
    try {
      toast.success('Login successful! Redirecting...');
      router.push('/');
    } catch (error) {
      console.error('OTP verification failed:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to verify OTP. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    console.log(`Logging in with ${provider}`);
  };

  const handleBackToEmail = () => {
    if (isAnyLoading) return;
    setIsOtpStep(false);
    setUserEmail('');
    emailForm.reset();
    otpForm.reset();
  };

  if (isOtpStep) {
    return (
      <div className="relative">
        <AuthCard
          title="Enter verification code"
          description={`We've sent a 6-digit code to ${userEmail}`}
          className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
        >
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-medium text-center block">
                      6-Digit OTP
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          containerClassName="justify-center"
                          disabled={isAnyLoading}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                            <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                            <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                            <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                            <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <Button type="submit" className="w-full h-11 font-medium" disabled={isAnyLoading}>
                  {isOtpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 font-medium"
                  onClick={handleBackToEmail}
                  disabled={isAnyLoading}
                >
                  Back to email
                </Button>
              </div>
            </form>
          </Form>
        </AuthCard>

        {/* Loading overlay for OTP step */}
        {isAnyLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-3">
              <Spinner size="md" />
              <span className="text-sm font-medium">{isOtpLoading && 'Verifying code...'}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <AuthCard
        title="Welcome back"
        description="Login with your preferred method"
        className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium border-2 hover:border-primary/50 transition-all"
              onClick={() => handleOAuthLogin('google')}
              disabled={isAnyLoading}
            >
              <GoogleIcon className="mr-2" size={18} />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium border-2 hover:border-primary/50 transition-all"
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={isAnyLoading}
            >
              <MicrosoftIcon className="mr-2" size={18} />
              Continue with Microsoft
            </Button>
          </div>

          {/* Divider */}
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="bg-card text-muted-foreground relative z-10 px-3 font-medium">
              Or continue with email
            </span>
          </div>

          {/* Email Form */}
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="h-11 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        disabled={isAnyLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 font-medium" disabled={isAnyLoading}>
                {isEmailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  'Continue with email'
                )}
              </Button>
            </form>
          </Form>

          {/* Sign up link */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className="underline underline-offset-4 hover:text-primary font-medium transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </AuthCard>

      {/* Loading overlay for main form */}
      {isAnyLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-sm font-medium">
              {isEmailLoading && 'Sending verification code...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
