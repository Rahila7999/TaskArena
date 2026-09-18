'use client';

import { Sidebar } from '../sidebar';
import { Header } from '../header';
import { StatsCards } from './stats-cards';
import { GamificationPreviewCards } from './gamification-cards';
import { TodaysQuests } from './todays-quests';
import { RecentActivity } from './recent-activity';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Good morning 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready to conquer today&apos;s quests?
              </p>
            </div>

            <StatsCards />
            <GamificationPreviewCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TodaysQuests />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
