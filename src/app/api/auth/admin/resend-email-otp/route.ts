import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/db';
import Otp from '@/db/schema/otp';
import User from '@/db/schema/user';

const resendEmailOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = resendEmailOtpSchema.safeParse(body);

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

    const { email } = parsedBody.data;

    await connectToDatabase();

    const isEmailExists = await User.exists({ email, emailVerified: true });
    if (!isEmailExists) {
      return NextResponse.json(
        { success: false, message: 'Email does not exist' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    console.log({
      email,
      otp,
      message: 'Sending OTP to email',
    });
    await Otp.create({ email, otp });

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully', otp },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
