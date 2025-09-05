import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';
import { generateICalContent } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  try {
    const events = await AirtableService.getEvents();
    const icalContent = generateICalContent(events);
    
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="events.ics"'
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 }
    );
  }
}