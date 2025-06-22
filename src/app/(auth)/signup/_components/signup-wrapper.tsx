'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { CandidateSignupForm } from './candidate-signup-form';

export function SignupWrapper() {
  const router = useRouter();
  const createUserMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      // Replace with your actual user creation logic
      console.log('Creating user:', data);
      return Promise.resolve(data);
    },
    onSuccess: () => {
      toast.success('User created successfully!');
      router.push('/console'); // Redirect to dashboard or home page after successful signup
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

  const handleOtpSubmit = async (data: { otp: string; email: string }) => {
    try {
      router.push('/'); // Redirect to dashboard or home page after successful login
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
