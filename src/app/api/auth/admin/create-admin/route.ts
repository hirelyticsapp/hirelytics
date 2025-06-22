import { NextResponse } from 'next/server';

import { connectToDatabase } from '@/db';
import User from '@/db/schema/user';

export const GET = async () => {
  await connectToDatabase();
  await User.create({
    email: 'sumantablog@gmail.com',
    role: 'admin',
    name: 'Sumanta Kabiraj',
    emailVerified: true,
  });
  return NextResponse.json(
    { success: true, message: 'Admin created successfully' },
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
