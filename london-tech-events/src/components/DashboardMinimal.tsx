'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface DashboardProps {
  stats: DashboardStats;
  loading?: boolean;
}

export default function DashboardMinimal({ stats, loading }: DashboardProps) {
  const statCards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-foreground',
    },
    {
      label: 'High Priority',
      value: stats.mustAttend,
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      label: 'Free for Students',
      value: stats.freeForStudents,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      label: 'This Month',
      value: stats.thisMonth,
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      label: 'Next 7 Days',
      value: stats.upcomingWeek,
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-muted/40">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="border-muted/40 hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}