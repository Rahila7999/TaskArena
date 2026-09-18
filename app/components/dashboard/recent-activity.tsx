'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockRecentActivity } from '../../lib/mock-data';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span>{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
