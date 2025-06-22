import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/db';
import Otp from '@/db/schema/otp';
import User from '@/db/schema/user';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsedBody = createUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request data', errors: parsedBody.error.errors },
      { status: 400 }
    );
  }
  try {
    await connectToDatabase();

    const isEmailExists = await User.findOne({ email: parsedBody.data.email });
    let user = isEmailExists;
    if (isEmailExists && isEmailExists.emailVerified === true) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified and exists in the system' },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isEmailExists) {
      user = await User.create({
        name: parsedBody.data.name,
        email: parsedBody.data.email,
        role: 'user',
        emailVerified: false,
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Failed to create user. Please try again later.' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await Otp.deleteMany({ email: user.email }); // Clear any existing OTPs for the user
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await Otp.create({ email: user.email, otp, role: 'user' });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.log('Error in user signup:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error. Please contact support.' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
