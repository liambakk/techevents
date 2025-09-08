import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types';
import { MapPin, Calendar, DollarSign } from 'lucide-react';

interface EventListItemProps {
  event: Event;
}

export default function EventListItem({ event }: EventListItemProps) {

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High Priority': return 'default';
      case 'Medium Priority': return 'secondary';
      case 'Low Priority': return 'outline';
      default: return 'outline';
    }
  };

  const costTypeColors: Record<string, string> = {
    'Free': 'text-green-700',
    'Free for Students': 'text-emerald-700',
    'Student Free': 'text-emerald-700',
    'Paid': 'text-red-700',
    'Early Bird Available': 'text-yellow-700',
  };

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-card hover:bg-accent/5 transition-colors border border-border/40 rounded-lg p-4 cursor-pointer">
        <div className="flex flex-col gap-3">
          {/* Header with title and priority badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                {event.fields['Event Name']}
              </h3>
              <p className="text-sm text-muted-foreground">
                {event.fields['Event Type']}
              </p>
            </div>
            {event.fields['Priority'] && (
              <Badge variant={getPriorityVariant(event.fields['Priority'])} className="shrink-0">
                {event.fields['Priority']}
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(event.fields['Date Start'])}</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{formatTime(event.fields['Date Start'])}</span>
            </div>
            
            {event.fields['Venue']?.toLowerCase() === 'virtual' ? (
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="line-clamp-1">{event.fields['Venue']}</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.fields['Venue'] + ', ' + (event.fields['Address'] || 'London'))}`, '_blank');
                }}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1 underline decoration-dotted underline-offset-2">
                  {event.fields['Venue']}
                </span>
              </button>
            )}
            
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span className={`font-medium ${costTypeColors[event.fields['Cost Type']] || 'text-gray-700'}`}>
                {event.fields['Cost Type']}
                {event.fields['Cost'] > 0 && ` • £${event.fields['Cost']}`}
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}