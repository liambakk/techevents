import type { FilterOptions } from '@/types';

interface FiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Web3/Blockchain">Web3/Blockchain</option>
            <option value="FinTech">FinTech</option>
            <option value="Venture Capital">Venture Capital</option>
            <option value="Startup">Startup</option>
            <option value="General Tech">General Tech</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.eventType || ''}
            onChange={(e) => onFilterChange({ ...filters, eventType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Conference">Conference</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Workshop">Workshop</option>
            <option value="Career Fair">Career Fair</option>
            <option value="Networking Event">Networking</option>
            <option value="Panel Discussion">Panel</option>
            <option value="Meetup">Meetup</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.costType || ''}
            onChange={(e) => onFilterChange({ ...filters, costType: e.target.value })}
          >
            <option value="">All</option>
            <option value="Free">Free</option>
            <option value="Free for Students">Free for Students</option>
            <option value="Paid">Paid</option>
            <option value="Early Bird Available">Early Bird</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="Must Attend">Must Attend</option>
            <option value="High Priority">High Priority</option>
            <option value="Medium Priority">Medium Priority</option>
            <option value="Low Priority">Low Priority</option>
            <option value="Optional">Optional</option>
          </select>
        </div>
      </div>
    </div>
  );
}