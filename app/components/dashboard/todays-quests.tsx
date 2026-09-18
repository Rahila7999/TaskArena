'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockTodaysQuests } from '../../lib/mock-data';

export function TodaysQuests() {
  const completedCount = mockTodaysQuests.filter(q => q.completed).length;
  const totalCount = mockTodaysQuests.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Quests</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTodaysQuests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                quest.completed
                  ? 'bg-muted/50 border-muted opacity-70'
                  : 'bg-card border-border hover:border-accent/50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                quest.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-muted-foreground'
              }`}>
                {quest.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {quest.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    quest.priority === 'high'
                      ? 'bg-red-500/10 text-red-600'
                      : quest.priority === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-600'
                      : 'bg-gray-500/10 text-gray-600'
                  }`}>
                    {quest.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">+{quest.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
