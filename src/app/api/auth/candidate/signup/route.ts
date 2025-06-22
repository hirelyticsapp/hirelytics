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
    if (isEmailExists && isEmailExists.emailVerified === true) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let user = isEmailExists;

    if (!(isEmailExists && isEmailExists.emailVerified === true)) {
      user = await User.create(parsedBody.data);
    }

    console.log('Creating user:', parsedBody.data, user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Failed to create user' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await Otp.create({ email: user.email, otp, role: 'user' });
    console.log({
      email: user.email,
      otp,
      message: 'Sending OTP to email',
    });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
