import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Event } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateICalContent(events: Event[]): string {
  const icalEvents = events.map((event: any) => {
    const startDate = new Date(event.fields['Date Start']);
    const endDate = event.fields['Date End'] ? 
      new Date(event.fields['Date End']) : 
      new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const formatICalDate = (date: Date) => 
      date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    return `BEGIN:VEVENT
SUMMARY:${event.fields['Event Name']}
DESCRIPTION:${event.fields['Description'] || ''}
LOCATION:${event.fields['Venue'] || ''}, ${event.fields['Address'] || ''}
URL:${event.fields['Website'] || ''}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
END:VEVENT`;
  }).join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//London Tech Events//EN
${icalEvents}
END:VCALENDAR`;
}