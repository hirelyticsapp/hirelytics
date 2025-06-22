'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function RecruiterLoginForm() {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      setEmail(data.email);
      setIsOtpStep(true);
    } catch (error) {
      console.error('Email submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (_data: OtpFormData) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setIsOtpStep(false);
    setEmail('');
    emailForm.reset();
    otpForm.reset();
  };

  if (isOtpStep) {
    return (
      <AuthCard
        title="Enter verification code"
        description={`We've sent a 6-digit code to ${email}`}
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
            <div className="space-y-3">
              <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 font-medium text-muted-foreground hover:text-foreground"
                onClick={handleBackToEmail}
              >
                Back to email
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Access your recruitment dashboard"
      className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
    >
      <div className="space-y-6">
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Work Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="recruiter@company.com"
                      className="h-11 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? 'Sending code...' : 'Send verification code'}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground space-y-3">
          <p className="text-xs bg-muted/50 rounded-lg px-3 py-2">
            🔒 Secure email-only authentication for recruiters
          </p>
          <div className="text-xs">
            New to Hirelytics?{' '}
            <a
              href="/recruiter/request-access"
              className="underline underline-offset-4 hover:text-primary font-medium transition-colors"
            >
              Request access
            </a>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
