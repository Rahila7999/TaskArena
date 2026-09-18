'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockGamificationCards } from '../../lib/mock-data';

export function GamificationPreviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {mockGamificationCards.map((card) => (
        <Card key={card.id} className="relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-3">{card.value}</div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-500`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{card.progress}% complete</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
