'use client';
import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { AuthCard } from '@/components/ui/auth-card';

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
      return await ky
        .post('/api/auth/admin/verify-init-otp', {
          json: { otp },
        })
        .json();
    },
    onSuccess: () => {
      setPhase('email');
      toast.success('Security key verified successfully!');
    },
    onError: (error) => {
      console.error('Error verifying security key:', error);
      toast.error('Failed to verify security key. Please try again.');
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
      return await ky
        .post('/api/auth/admin/send-email-otp', {
          json: { email },
        })
        .json();
    },
    onSuccess: () => {
      setPhase('otp2');
      toast.success('Verification code sent to your email!');
    },
    onError: (error) => {
      console.error('Error sending email OTP:', error);
      toast.error('Failed to send verification code. Please try again.');
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
      return await ky
        .post('/api/auth/admin/verify-email-otp', {
          json: { otp, email: userEmail },
        })
        .json();
    },
    onSuccess: () => {
      setPhase('complete');
      toast.success('Email verified successfully!');
      router.push('/');
    },
    onError: (error) => {
      console.error('Error verifying email OTP:', error);
      toast.error('Failed to verify email OTP. Please try again.');
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

  const handleResendOtp = async () => {
    try {
      console.log('Resending OTP to:', userEmail);
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
  // const isOtp1Loading = verifySecurityKeyValidationMutation.isPending;
  // const isEmailLoading = sendAdminEmailOtpMutation.isPending;
  const isOtp2Loading = isAuthLoading;
  // const isResendLoading = resendAdminEmailOtpMutation.isPending;
  // const isAnyLoading = isOtp1Loading || isEmailLoading || isOtp2Loading || isResendLoading;

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
      {/* {isAnyLoading && (
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
      )} */}
    </div>
  );
}
