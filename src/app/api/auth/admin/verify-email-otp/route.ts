import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/db';
import Otp from '@/db/schema/otp';
import User from '@/db/schema/user';
import { setAuthCookieInResponse } from '@/lib/auth/cookies';
import { createUserSession } from '@/lib/auth/server';

const verifyEmailOtp = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedBody = verifyEmailOtp.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request data',
        errors: parsedBody.error.errors,
      },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { otp, email } = parsedBody.data;
  try {
    await connectToDatabase();
    const isEmailExists = await User.findOne({ email });
    if (!isEmailExists) {
      return NextResponse.json(
        { success: false, message: 'Email does not exist' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const isOtpExists = await Otp.findOne({ email, otp });
    if (!isOtpExists) {
      return NextResponse.json(
        { success: false, message: 'OTP not found for this email' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const token = await createUserSession(isEmailExists, request);
    return setAuthCookieInResponse(
      NextResponse.json(
        { success: true, message: 'OTP verified successfully' },
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
      token
    );
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
