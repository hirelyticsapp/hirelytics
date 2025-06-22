'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

type SignupFormData = z.infer<typeof signupSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

type LoadingState = {
  action: 'oauth' | 'signup' | 'otp' | null;
  provider?: 'google' | 'microsoft';
  message: string;
};

interface CandidateSignupFormProps {
  onOAuthSignup: (provider: 'google' | 'microsoft') => void;
  onSignupSubmit: (data: { name: string; email: string }) => Promise<void>;
  onOtpSubmit: (data: { otp: string; email: string }) => Promise<void>;
}

export function CandidateSignupForm({
  onOAuthSignup,
  onSignupSubmit,
  onOtpSubmit,
}: CandidateSignupFormProps) {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [_userName, setUserName] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    action: null,
    message: '',
  });

  const isLoading = loadingState.action !== null;

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleSignupSubmit = async (data: SignupFormData) => {
    setLoadingState({ action: 'signup', message: 'Creating your account...' });
    try {
      await onSignupSubmit(data);
      setUserEmail(data.email);
      setUserName(data.name);
      setIsOtpStep(true);
    } catch (error) {
      console.error('Signup submission failed:', error);
    } finally {
      setLoadingState({ action: null, message: '' });
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setLoadingState({ action: 'otp', message: 'Verifying your account...' });
    try {
      await onOtpSubmit({ otp: data.otp, email: userEmail });
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoadingState({ action: null, message: '' });
    }
  };

  const _handleOAuthSignup = (provider: 'google' | 'microsoft') => {
    setLoadingState({
      action: 'oauth',
      provider,
      message: `Creating account with ${provider === 'google' ? 'Google' : 'Microsoft'}...`,
    });
    onOAuthSignup(provider);
  };

  const handleBackToSignup = () => {
    if (isLoading) return;
    setIsOtpStep(false);
    setUserEmail('');
    setUserName('');
    signupForm.reset();
    otpForm.reset();
    setLoadingState({ action: null, message: '' });
  };

  if (isOtpStep) {
    return (
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
              <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium"
                onClick={handleBackToSignup}
                disabled={isLoading}
              >
                Back to signup
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Join thousands of candidates finding their dream jobs"
      className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-medium border-2 hover:border-primary/50 transition-all"
            onClick={() => onOAuthSignup('google')}
          >
            <GoogleIcon className="mr-2" size={18} />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-medium border-2 hover:border-primary/50 transition-all"
            onClick={() => onOAuthSignup('microsoft')}
          >
            <MicrosoftIcon className="mr-2" size={18} />
            Continue with Microsoft
          </Button>
        </div>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="bg-card text-muted-foreground relative z-10 px-3 font-medium">
            Or create account with email
          </span>
        </div>

        {/* Signup Form */}
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-6">
            <FormField
              control={signupForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="John Doe"
                      className="h-11 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>

        {/* Login link */}
        <div className="text-center text-sm">
          Already have an account?{' '}
          <a
            href="/login"
            className="underline underline-offset-4 hover:text-primary font-medium transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </AuthCard>
  );
}
