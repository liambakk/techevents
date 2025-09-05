'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, DollarSign } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
}

export default function EventCardMinimal({ event, onUpdate }: EventCardProps) {
  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'Registration Status': 'Registered' })
      });

      if (response.ok) {
        toast.success('Registration status updated!');
        if (onUpdate) onUpdate();
      }
    } catch (_error) {
      toast.error('Failed to update registration');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must Attend': return 'destructive';
      case 'High Priority': return 'default';
      default: return 'secondary';
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
    <Card className="p-6 hover:shadow-sm transition-shadow border-muted/40">
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
          
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[200px]">{event.fields['Venue']}</span>
          </div>

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

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleRegister}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Mark as Registered
          </Button>
          
          {event.fields['Website'] && (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              <a href={event.fields['Website']} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View Details
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}