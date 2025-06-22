'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { authClient } from '@/auth/client';
import { api } from '@/trpc/react';

import { CandidateSignupForm } from './candidate-signup-form';

export function SignupWrapper() {
  const router = useRouter();
  const createUserMutation = api.auth.createUser.useMutation({
    onSuccess: () => {
      toast.success('User created successfully! Please check your email for verification.');
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('User with this email already exists. Please try logging in instead.');
      } else {
        toast.error(error.message || 'Failed to create user. Please try again.');
      }
    },
  });

  const handleOAuthSignup = async (provider: 'google' | 'microsoft') => {
    console.log(`Signing up with ${provider}`);
  };

  const handleSignupSubmit = async (data: { name: string; email: string }) => {
    await createUserMutation.mutateAsync({
      email: data.email,
      name: data.name,
    });
  };

  const handleOtpSubmit = async (data: { otp: string; email: string }) => {
    try {
      await authClient.signIn.emailOtp({
        email: data.email,
        otp: data.otp,
      });
      router.push('/console'); // Redirect to dashboard or home page after successful login
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to verify OTP. Please try again.');
      } else {
        toast.error('An unexpected error occurred while verifying OTP. Please try again later.');
      }
    }
  };

  return (
    <CandidateSignupForm
      onOAuthSignup={handleOAuthSignup}
      onSignupSubmit={handleSignupSubmit}
      onOtpSubmit={handleOtpSubmit}
    />
  );
}
