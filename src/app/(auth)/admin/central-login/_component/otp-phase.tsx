'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpPhaseProps {
  onSubmit: (otp: string) => Promise<void>;
  buttonText: string;
  showResendButton?: boolean;
  onResend?: () => void;
  isLoading?: boolean;
  loadingText?: string;
  isResending?: boolean;
}

export default function OtpPhase({
  onSubmit,
  buttonText,
  showResendButton = false,
  onResend,
  isLoading = false,
  loadingText,
  isResending = false,
}: OtpPhaseProps) {
  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleSubmit = async (data: OtpFormData) => {
    await onSubmit(data.otp);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-6 py-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-sm font-medium text-center block">6-Digit OTP</FormLabel>
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
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2 pb-6 px-6">
          <Button type="submit" className="w-full h-11" disabled={isLoading || isResending}>
            {isLoading ? loadingText || 'Verifying...' : buttonText}
          </Button>

          {showResendButton && onResend && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={onResend}
              disabled={isLoading || isResending}
            >
              {isResending ? 'Resending...' : 'Resend OTP'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
