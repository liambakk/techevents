import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';

export async function GET(_request: NextRequest) {
  try {
    const stats = await AirtableService.getDashboardStats();
    return NextResponse.json(stats);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}