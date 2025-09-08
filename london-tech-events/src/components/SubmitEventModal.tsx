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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SubmitEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmitEventModal({ open, onOpenChange }: SubmitEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    category: [] as string[],
    dateStart: undefined as Date | undefined,
    dateEnd: undefined as Date | undefined,
    venue: '',
    address: '',
    format: 'In-Person' as 'In-Person' | 'Virtual' | 'Hybrid',
    cost: '',
    costType: 'Paid',
    description: '',
    website: '',
    registrationLink: '',
    targetAudience: [] as string[],
    priority: 'Medium Priority',
    estimatedAttendees: '',
    notes: '',
    submitterName: '',
    submitterEmail: '',
  });

  const eventTypes = [
    'Conference',
    'Workshop',
    'Meetup',
    'Hackathon',
    'Webinar',
    'Networking',
    'Panel Discussion',
    'Demo Day',
    'Fireside Chat',
    'Bootcamp',
    'Social',
    'Other',
  ];

  const categories = [
    'AI/ML',
    'Blockchain',
    'Cloud',
    'Cybersecurity',
    'Data Science',
    'DevOps',
    'Fintech',
    'Frontend',
    'Backend',
    'Mobile',
    'Product',
    'Startup',
    'Web3',
    'Other',
  ];

  const targetAudiences = [
    'Students',
    'Professionals',
    'Entrepreneurs',
    'Developers',
    'Designers',
    'Product Managers',
    'Everyone',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.eventName || !formData.dateStart || !formData.venue || !formData.submitterEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dateStart: formData.dateStart?.toISOString(),
          dateEnd: formData.dateEnd?.toISOString(),
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          estimatedAttendees: formData.estimatedAttendees ? parseInt(formData.estimatedAttendees) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Submission error:', errorData);
        throw new Error(`Failed to submit event: ${response.status}`);
      }

      const result = await response.json();
      
      // If using test email service, show the preview URL
      if (result.previewUrl) {
        console.log('Email preview URL:', result.previewUrl);
        toast.success('Event submitted! Check console for email preview URL.');
      } else {
        toast.success('Event submitted successfully! We\'ll review it and get back to you soon.');
      }
      onOpenChange(false);
      
      // Reset form
      setFormData({
        eventName: '',
        eventType: '',
        category: [],
        dateStart: undefined,
        dateEnd: undefined,
        venue: '',
        address: '',
        format: 'In-Person',
        cost: '',
        costType: 'Paid',
        description: '',
        website: '',
        registrationLink: '',
        targetAudience: [],
        priority: 'Medium Priority',
        estimatedAttendees: '',
        notes: '',
        submitterName: '',
        submitterEmail: '',
      });
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast.error(error.message || 'Failed to submit event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Submit a New Event</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit a new tech event. We&apos;ll review your submission and add it to our directory if approved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name *</Label>
            <Input
              id="eventName"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              placeholder="e.g., London Tech Summit 2024"
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData({ ...formData, eventType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.category.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, category: [...formData.category, cat] });
                      } else {
                        setFormData({ ...formData, category: formData.category.filter(c => c !== cat) });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Start */}
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateStart ? format(formData.dateStart, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-3" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateStart}
                  onSelect={(date) => setFormData({ ...formData, dateStart: date })}
                  initialFocus
                  className="w-full [&_.rdp-root]:w-full [&_.rdp-month]:w-full [&_.rdp-week]:justify-between [&_.rdp-day]:flex-1"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date End */}
          <div className="space-y-2">
            <Label>End Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateEnd ? format(formData.dateEnd, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-3" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateEnd}
                  onSelect={(date) => setFormData({ ...formData, dateEnd: date })}
                  initialFocus
                  className="w-full [&_.rdp-root]:w-full [&_.rdp-month]:w-full [&_.rdp-week]:justify-between [&_.rdp-day]:flex-1"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g., ExCeL London"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., Royal Victoria Dock, 1 Western Gateway"
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value: 'In-Person' | 'Virtual' | 'Hybrid') => 
                setFormData({ ...formData, format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (£)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0"
                min="0"
                disabled={formData.costType === 'Free'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costType">Cost Type</Label>
              <Select
                value={formData.costType}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    costType: value,
                    cost: value === 'Free' ? '0' : formData.cost 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Free for Students">Free for Students</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief description of the event..."
              rows={3}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Event Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* Registration Link */}
          <div className="space-y-2">
            <Label htmlFor="registrationLink">Registration Link</Label>
            <Input
              id="registrationLink"
              type="url"
              value={formData.registrationLink}
              onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
              placeholder="https://example.com/register"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <Label>Target Audience</Label>
            <div className="grid grid-cols-3 gap-2">
              {targetAudiences.map((audience) => (
                <label key={audience} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(audience)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, targetAudience: [...formData.targetAudience, audience] });
                      } else {
                        setFormData({ ...formData, targetAudience: formData.targetAudience.filter(a => a !== audience) });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{audience}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High Priority">High Priority</SelectItem>
                <SelectItem value="Medium Priority">Medium Priority</SelectItem>
                <SelectItem value="Low Priority">Low Priority</SelectItem>
                <SelectItem value="Optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Attendees */}
          <div className="space-y-2">
            <Label htmlFor="estimatedAttendees">Estimated Attendees</Label>
            <Input
              id="estimatedAttendees"
              type="number"
              value={formData.estimatedAttendees}
              onChange={(e) => setFormData({ ...formData, estimatedAttendees: e.target.value })}
              placeholder="100"
              min="0"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

          {/* Submitter Information */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">Your Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="submitterName">Your Name</Label>
              <Input
                id="submitterName"
                value={formData.submitterName}
                onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitterEmail">Your Email *</Label>
              <Input
                id="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}