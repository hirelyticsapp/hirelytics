import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/db';
import Otp from '@/db/schema/otp';
import User from '@/db/schema/user';

const recruiterLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsedBody = recruiterLoginSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request data', errors: parsedBody.error.errors },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await connectToDatabase();
    const { email } = parsedBody.data;
    const isEmailExists = await User.exists({ email, emailVerified: true, role: 'recruiter' });
    if (!isEmailExists) {
      return NextResponse.json(
        { success: false, message: 'Email does not exist' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    await Otp.deleteMany({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    console.log({
      email,
      otp,
      message: 'Sending OTP to email',
    });
    await Otp.create({ email, otp });
    return NextResponse.json(
      { success: true, message: 'OTP sent successfully' },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
