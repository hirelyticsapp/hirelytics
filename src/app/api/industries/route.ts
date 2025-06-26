import { NextResponse } from 'next/server';

import { industriesData } from '@/lib/constants/industry-data';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const industries = Object.entries(industriesData).map(([key, data]) => ({
      value: key,
      label: data.label,
      icon: data.icon.name,
    }));

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}
