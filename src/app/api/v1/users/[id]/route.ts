import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db';
import User from '@/db/schema/user';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const user = await User.findOne({ _id: id, deletedAt: null });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found or deleted' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const userData = await req.json();
    const { id } = await params;
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    user.deletedAt = new Date();
    await user.save();
    return NextResponse.json({ success: true, message: 'User soft-deleted successfully' });
  } catch (error) {
    console.error('Error soft-deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
