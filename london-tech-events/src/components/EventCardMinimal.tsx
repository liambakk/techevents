'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export default function EventCardMinimal({ event }: EventCardProps) {

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High Priority': return 'default';
      case 'Medium Priority': return 'secondary';
      default: return 'outline';
    }
  };

  const getCostBadge = () => {
    const costType = event.fields['Cost Type'];
    if (costType === 'Free') return { text: 'Free', variant: 'outline' as const };
    if (costType === 'Free for Students') return { text: 'Student Free', variant: 'secondary' as const };
    if (costType === 'Paid') return { text: `£${event.fields['Cost']}`, variant: 'default' as const };
    return null;
  };

  const costBadge = getCostBadge();

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="p-6 hover:shadow-sm transition-shadow border-muted/40 cursor-pointer">
        <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base truncate text-foreground">
              {event.fields['Event Name']}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {event.fields['Event Type']}
            </p>
          </div>
          <Badge variant={getPriorityColor(event.fields['Priority'])} className="shrink-0">
            {event.fields['Priority']}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
              <span className="truncate max-w-[200px]">{event.fields['Venue']}</span>
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
              <span className="truncate max-w-[200px] underline decoration-dotted underline-offset-2">
                {event.fields['Venue']}
              </span>
            </button>
          )}

          {costBadge && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <Badge variant={costBadge.variant} className="h-5 px-2">
                {costBadge.text}
              </Badge>
            </div>
          )}
        </div>

        {/* Categories */}
        {Array.isArray(event.fields['Category']) && event.fields['Category'].length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.fields['Category'].slice(0, 3).map((cat, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        </div>
      </Card>
    </Link>
  );
}