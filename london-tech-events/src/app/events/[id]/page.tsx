'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Globe,
  ExternalLink,
  Info,
  Share2,
  Copy,
  Tag
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import lbsLogo from '@/assets/lbs.png';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          toast.error('Event not found');
          router.push('/');
        }
      } catch (_error) {
        toast.error('Failed to load event');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, router]);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High Priority': return 'default';
      case 'Medium Priority': return 'secondary';
      case 'Low Priority': return 'outline';
      default: return 'outline';
    }
  };

  const getCostVariant = (costType: string) => {
    if (costType === 'Free' || costType === 'Free for Students') return 'secondary';
    if (costType === 'Paid') return 'default';
    return 'outline';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'secondary';
      case 'Tentative': return 'default';
      case 'Cancelled': return 'destructive';
      case 'Postponed': return 'outline';
      case 'Sold Out': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Image 
                src={lbsLogo} 
                alt="LBS Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Tech Events Directory
                </h1>
                <span className="text-sm text-muted-foreground">
                  Event Details
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>

        {/* Main Content Grid with Animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.2,
              ease: "easeOut"
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <Card className="border-muted/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {event.fields['Event Name']}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {event.fields['Event Type']}
                      </Badge>
                      <Badge variant="outline">
                        {event.fields['Format']}
                      </Badge>
                      <Badge variant={getStatusVariant(event.fields['Status'])}>
                        {event.fields['Status']}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant={getPriorityVariant(event.fields['Priority'])}
                    className="shrink-0"
                  >
                    {event.fields['Priority']}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            {event.fields['Description'] && (
              <Card className="border-muted/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    About This Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.fields['Description']}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Date, Time & Location */}
            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {formatDate(event.fields['Date Start'])}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.fields['Date End'] && formatDate(event.fields['Date End']) !== formatDate(event.fields['Date Start']) && 
                        `Until ${formatDate(event.fields['Date End'])}`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {formatTime(event.fields['Date Start'])} - {formatTime(event.fields['Date End'])}
                    </p>
                    <p className="text-sm text-muted-foreground">Local Time</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  {event.fields['Venue']?.toLowerCase() === 'virtual' ? (
                    <>
                      <svg className="h-4 w-4 text-muted-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{event.fields['Venue']}</span>
                        <p className="text-sm text-muted-foreground">{event.fields['Address']}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Format: {event.fields['Format']}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.fields['Venue'] + ', ' + (event.fields['Address'] || 'London'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-2"
                        >
                          {event.fields['Venue']}
                        </a>
                        <p className="text-sm text-muted-foreground">{event.fields['Address']}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Format: {event.fields['Format']}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories & Audience */}
            {(event.fields['Category'] || event.fields['Target Audience']) && (
              <Card className="border-muted/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories & Audience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.fields['Category'] && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const category = event.fields['Category'];
                          let categories: string[] = [];
                          if (typeof category === 'string') {
                            categories = (category as string).split(';').map(cat => cat.trim()).filter(cat => cat);
                          } else if (Array.isArray(category)) {
                            categories = category as string[];
                          }
                          return categories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary">
                              {cat}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {event.fields['Target Audience'] && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Target Audience</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const targetAudience = event.fields['Target Audience'];
                          let audiences: string[] = [];
                          if (typeof targetAudience === 'string') {
                            audiences = (targetAudience as string).split(';').map(audience => audience.trim()).filter(audience => audience);
                          } else if (Array.isArray(targetAudience)) {
                            audiences = targetAudience as string[];
                          }
                          return audiences.map((audience, idx) => (
                            <Badge key={idx} variant="outline">
                              {audience}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {event.fields['Notes'] && (
              <Card className="border-muted/40 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.fields['Notes']}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Registration */}
            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Price</span>
                    </div>
                    <Badge variant={getCostVariant(event.fields['Cost Type'])}>
                      {event.fields['Cost Type']}
                    </Badge>
                  </div>

                  {event.fields['Cost'] > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-xl font-semibold">£{event.fields['Cost']}</span>
                    </div>
                  )}

                  {event.fields['Estimated Attendees'] && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Expected</span>
                      </div>
                      <span className="font-medium">{event.fields['Estimated Attendees']} attendees</span>
                    </div>
                  )}

                </div>

                <Separator />

                <div className="space-y-3">

                  {event.fields['Registration Link'] && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <a href={event.fields['Registration Link']} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Register on Event Site
                      </a>
                    </Button>
                  )}

                  {event.fields['Website'] && (
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full"
                    >
                      <a href={event.fields['Website']} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Event Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}