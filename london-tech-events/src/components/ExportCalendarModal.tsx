'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Copy, Check, Calendar, Download, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

export default function ExportCalendarModal({
  open,
  onOpenChange,
  onDownload,
}: ExportCalendarModalProps) {
  const [copied, setCopied] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  
  // Generate the iCal subscription URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const icalUrl = `${baseUrl}/api/calendar/export`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(icalUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Export To Calendar
          </DialogTitle>
          <DialogDescription>
            Choose how you want to add these events to your calendar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* iCal Subscription Link */}
          <div className="space-y-2">
            <Label htmlFor="ical-link">Calendar Subscription Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="ical-link"
                value={icalUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={copyToClipboard}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this link and paste it into your calendar app (Google Calendar, Apple Calendar, Outlook, etc.) to subscribe to these events
            </p>
          </div>

          {/* Instructions Dropdown */}
          <Collapsible 
            open={instructionsOpen} 
            onOpenChange={setInstructionsOpen}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-3 h-auto font-normal hover:bg-muted/50"
              >
                <span className="text-sm font-medium">How to add to your calendar</span>
                {instructionsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="space-y-3 text-sm text-muted-foreground border-l-2 border-muted pl-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Google Calendar:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open Google Calendar</li>
                    <li>Click the + next to &quot;Other calendars&quot;</li>
                    <li>Select &quot;From URL&quot;</li>
                    <li>Paste the link above and click &quot;Add calendar&quot;</li>
                  </ol>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Apple Calendar:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open Calendar app</li>
                    <li>Go to File → New Calendar Subscription</li>
                    <li>Paste the link and click &quot;Subscribe&quot;</li>
                  </ol>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Outlook:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Outlook.com</li>
                    <li>Click &quot;Add calendar&quot; → &quot;Subscribe from web&quot;</li>
                    <li>Paste the link and click &quot;Import&quot;</li>
                  </ol>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Download Option */}
          <div className="pt-4">
            <Button
              onClick={() => {
                onDownload();
                onOpenChange(false);
              }}
              variant="outline"
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download .ics file instead
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Download a one-time snapshot of events to import manually
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}