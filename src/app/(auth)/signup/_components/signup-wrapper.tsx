'use client';

import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { CandidateSignupForm } from './candidate-signup-form';

export function SignupWrapper() {
  const router = useRouter();
  const createUserMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      return await ky
        .post('/api/auth/candidate/signup', {
          json: data,
        })
        .json();
    },
    onSuccess: () => {
      toast.success('User created successfully!');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create user. Please try again.');
      } else {
        toast.error(
          'An unexpected error occurred while creating the user. Please try again later.'
        );
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

  const otpValidateMutation = useMutation({
    mutationFn: async (data: { otp: string; email: string }) => {
      return await ky
        .post('/api/auth/candidate/verify-otp', {
          json: data,
        })
        .json();
    },
    onSuccess: () => {
      toast.success('OTP verified successfully!');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to verify OTP. Please try again.');
      } else {
        toast.error('An unexpected error occurred while verifying OTP. Please try again later.');
      }
    },
  });

  const handleOtpSubmit = async (data: { otp: string; email: string }) => {
    try {
      await otpValidateMutation.mutateAsync(data);
      toast.success('OTP verified successfully!');
      router.push('/'); // Redirect to home or dashboard after successful verification
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
