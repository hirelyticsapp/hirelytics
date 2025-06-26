import { NextResponse } from 'next/server';

import { mockOrganizations } from '@/lib/constants/industry-data';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: mockOrganizations,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
