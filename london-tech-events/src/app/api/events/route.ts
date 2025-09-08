import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      priority: searchParams.get('priority') || undefined,
      costType: searchParams.get('costType') || undefined,
    };

    const events = await AirtableService.getEvents(filters);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = await AirtableService.createEvent(body);
    return NextResponse.json(event);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}