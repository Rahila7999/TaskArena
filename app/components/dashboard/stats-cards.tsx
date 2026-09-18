'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockStatsCards } from '../../lib/mock-data';

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {mockStatsCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change} from last week
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
