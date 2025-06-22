'use client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { AuthCard } from '@/components/ui/auth-card';
import { Spinner } from '@/components/ui/spinner';

import EmailPhase from './email-phase';
import OtpPhase from './otp-phase';

type FormPhase = 'otp1' | 'email' | 'otp2' | 'complete';

export default function CentralLoginForm() {
  const [phase, setPhase] = useState<FormPhase>('otp1');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();

  const handleVerifyIntOtp = useMutation({
    mutationFn: async (otp: string) => {
      return await axios.post('/api/auth/admin/verify-init-otp', { otp });
    },
    onSuccess: () => {
      setPhase('email');
      toast.success('Security key verified successfully!');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data.message || 'Failed to verify OTP. Please try again.');
      } else {
        toast.error('An unexpected error occurred while verifying OTP. Please try again later.');
      }
    },
  });

  const handleOtp1Submit = async (otp: string) => {
    try {
      await handleVerifyIntOtp.mutateAsync(otp);
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const handleSendEmailOtp = useMutation({
    mutationFn: async (email: string) => {
      return await axios.post('/api/auth/admin/send-email-otp', {
        email,
      });
    },
    onSuccess: () => {
      setPhase('otp2');
      toast.success('Verification code sent to your email!');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data.message || 'Failed to send verification code. Please try again.'
        );
      } else {
        toast.error(
          'An unexpected error occurred while sending verification code. Please try again later.'
        );
      }
    },
  });

  const handleEmailSubmit = async (email: string) => {
    try {
      setUserEmail(email);
      await handleSendEmailOtp.mutateAsync(email);
    } catch (error) {
      console.error('Email submission error:', error);
    }
  };

  const handleVerifyEmailOtp = useMutation({
    mutationFn: async (otp: string) => {
      return await axios.post('/api/auth/admin/verify-email-otp', {
        otp,
        email: userEmail,
      });
    },
    onSuccess: () => {
      setPhase('complete');
      toast.success('Email verified successfully!');
      router.push('/');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data.message || 'Failed to verify email OTP. Please try again.'
        );
      } else {
        toast.error(
          'An unexpected error occurred while verifying email OTP. Please try again later.'
        );
      }
    },
  });

  const handleOtp2Submit = async (_otp: string) => {
    setIsAuthLoading(true);
    try {
      await handleVerifyEmailOtp.mutateAsync(_otp);
    } catch (error) {
      console.error('Final OTP verification error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resendAdminEmailOtpMutation = useMutation({
    mutationFn: async () => {
      return await axios.post('/api/auth/admin/resend-email-otp', {
        email: userEmail,
      });
    },
    onSuccess: () => {
      toast.success('Verification code resent successfully!');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data.message || 'Failed to resend verification code. Please try again.'
        );
      } else {
        toast.error(
          'An unexpected error occurred while resending verification code. Please try again later.'
        );
      }
    },
  });

  const handleResendOtp = async () => {
    try {
      await resendAdminEmailOtpMutation.mutateAsync();
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  const getPhaseContent = () => {
    switch (phase) {
      case 'otp1':
        return {
          title: 'Verify Your Identity',
          description: 'Enter the 6-digit OTP to continue',
        };
      case 'email':
        return {
          title: 'Enter Your Email',
          description: 'Please provide your email address',
        };
      case 'otp2':
        return {
          title: 'Email Verification',
          description: `Enter the OTP sent to ${userEmail}`,
        };
      case 'complete':
        return {
          title: 'Login Successful',
          description: 'You have been successfully authenticated',
        };
    }
  };

  // Determine loading states from mutations
  const isOtp1Loading = handleVerifyIntOtp.isPending;
  const isEmailLoading = handleSendEmailOtp.isPending;
  const isOtp2Loading = isAuthLoading;
  const isResendLoading = resendAdminEmailOtpMutation.isPending;
  const isAnyLoading = isOtp1Loading || isEmailLoading || isOtp2Loading || isResendLoading;

  const currentContent = getPhaseContent();

  return (
    <div className="relative">
      <AuthCard
        title={currentContent.title}
        description={currentContent.description}
        className="w-full max-w-md shadow-lg border-0 bg-card/50 backdrop-blur-sm"
      >
        {phase === 'otp1' && (
          <OtpPhase
            onSubmit={handleOtp1Submit}
            buttonText="Verify OTP"
            // isLoading={isOtp1Loading}
            loadingText="Verifying security key..."
          />
        )}

        {phase === 'email' && (
          <EmailPhase
            onSubmit={handleEmailSubmit}
            // isLoading={isEmailLoading}
            loadingText="Sending verification code..."
          />
        )}

        {phase === 'otp2' && (
          <OtpPhase
            onSubmit={handleOtp2Submit}
            buttonText="Complete Login"
            showResendButton={true}
            onResend={handleResendOtp}
            isLoading={isOtp2Loading}
            loadingText="Completing authentication..."
            // isResending={isResendLoading}
          />
        )}
      </AuthCard>

      {/* Loading overlay */}
      {isAnyLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-sm font-medium">
              {isOtp1Loading && 'Verifying security key...'}
              {isEmailLoading && 'Sending verification code...'}
              {isOtp2Loading && 'Completing authentication...'}
              {isResendLoading && 'Resending verification code...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
