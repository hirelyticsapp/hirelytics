import { NextResponse } from 'next/server';

import { industriesData } from '@/lib/constants/industry-data';

export async function GET(request: Request, { params }: { params: Promise<{ industry: string }> }) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { industry } = await params;
    const industryData = industriesData[industry as keyof typeof industriesData];

    if (!industryData) {
      return NextResponse.json({ success: false, error: 'Industry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: industryData.skills,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch skills' }, { status: 500 });
  }
}
