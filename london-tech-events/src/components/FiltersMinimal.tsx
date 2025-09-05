'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface FiltersProps {
  filters: {
    searchTerm: string;
    category: string;
    eventType: string;
    costType: string;
    priority: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function FiltersMinimal({ filters, onFilterChange }: FiltersProps) {
  const hasActiveFilters = filters.searchTerm || filters.category || 
    filters.eventType || filters.costType || filters.priority;

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      category: '',
      eventType: '',
      costType: '',
      priority: '',
    });
  };

  return (
    <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-9 h-9 border-muted/40"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            />
          </div>

          {/* Category Filter */}
          <Select 
            value={filters.category} 
            onValueChange={(value) => onFilterChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-[140px] h-9 border-muted/40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Categories</SelectItem>
              <SelectItem value="AI/ML">AI/ML</SelectItem>
              <SelectItem value="Web3/Blockchain">Web3</SelectItem>
              <SelectItem value="FinTech">FinTech</SelectItem>
              <SelectItem value="Venture Capital">VC</SelectItem>
              <SelectItem value="Startup">Startup</SelectItem>
              <SelectItem value="General Tech">Tech</SelectItem>
            </SelectContent>
          </Select>

          {/* Event Type Filter */}
          <Select 
            value={filters.eventType} 
            onValueChange={(value) => onFilterChange({ ...filters, eventType: value })}
          >
            <SelectTrigger className="w-[120px] h-9 border-muted/40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Types</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Hackathon">Hackathon</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Career Fair">Career</SelectItem>
              <SelectItem value="Networking Event">Network</SelectItem>
              <SelectItem value="Panel Discussion">Panel</SelectItem>
              <SelectItem value="Meetup">Meetup</SelectItem>
            </SelectContent>
          </Select>

          {/* Cost Filter */}
          <Select 
            value={filters.costType} 
            onValueChange={(value) => onFilterChange({ ...filters, costType: value })}
          >
            <SelectTrigger className="w-[120px] h-9 border-muted/40">
              <SelectValue placeholder="Cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Free for Students">Student Free</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Early Bird Available">Early Bird</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select 
            value={filters.priority} 
            onValueChange={(value) => onFilterChange({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-[140px] h-9 border-muted/40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Priorities</SelectItem>
              <SelectItem value="Must Attend">Must Attend</SelectItem>
              <SelectItem value="High Priority">High Priority</SelectItem>
              <SelectItem value="Medium Priority">Medium</SelectItem>
              <SelectItem value="Low Priority">Low Priority</SelectItem>
              <SelectItem value="Optional">Optional</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              onClick={clearFilters}
              variant="ghost" 
              size="sm"
              className="h-9 px-3"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}