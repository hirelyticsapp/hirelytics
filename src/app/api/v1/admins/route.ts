import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db';
import { paginatedData, parsePaginationParams } from '@/db/helpet';
import User from '@/db/schema/user';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const { limit, skip } = parsePaginationParams(searchParams);
    await connectToDatabase();
    const filter = { role: 'admin' };
    const [totalCount, users] = await paginatedData(
      User,
      limit,
      skip,
      filter,
      'name email role createdAt updatedAt'
    );

    return NextResponse.json({ success: true, data: users, totalCount });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
