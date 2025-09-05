import { motion } from 'framer-motion';
import EventCard from './EventCard';
import type { Event, DashboardStats } from '@/types';

interface DashboardProps {
  events: Event[];
  stats: DashboardStats | null;
  onRefresh?: () => void;
}

export default function Dashboard({ events, stats, onRefresh }: DashboardProps) {
  const upcomingEvents = events
    .filter(e => new Date(e.fields['Date Start']) >= new Date())
    .slice(0, 6);

  const mustAttendEvents = events
    .filter(e => e.fields['Priority'] === 'Must Attend')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            color="from-blue-400 to-blue-600"
            icon="📅"
          />
          <StatCard
            title="Must Attend"
            value={stats.mustAttend}
            color="from-red-400 to-red-600"
            icon="🔴"
          />
          <StatCard
            title="Free for Students"
            value={stats.freeForStudents}
            color="from-green-400 to-green-600"
            icon="🎓"
          />
          <StatCard
            title="Registered"
            value={stats.registered}
            color="from-purple-400 to-purple-600"
            icon="✅"
          />
        </div>
      )}

      {/* Must Attend Section */}
      {mustAttendEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Must Attend Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mustAttendEvents.map((event) => (
              <EventCard key={event.id} event={event} onUpdate={onRefresh} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} onUpdate={onRefresh} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, color, icon }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );
}