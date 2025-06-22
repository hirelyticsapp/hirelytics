import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyHOTP } from '@/lib/otpauth';

const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export async function POST(req: NextRequest) {
  // Your implementation here
  const body = await req.json();
  const parsedBody = verifyOtpSchema.safeParse(body);

  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid request data',
        errors: parsedBody.error.errors,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { otp } = parsedBody.data;

  try {
    const isValid = verifyHOTP(otp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
