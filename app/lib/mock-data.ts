// Temporary mock data for Phase 1 - will be replaced with MongoDB
export const mockStats = {
  totalTasks: 127,
  completedToday: 12,
  streak: 7,
  points: 2840,
  rank: 3,
  totalProjects: 8,
  activeSprints: 2,
};

export const mockGamificationCards = [
  {
    id: 1,
    title: 'Daily Streak',
    value: '7 days',
    icon: '🔥',
    progress: 70,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 2,
    title: 'Weekly Goals',
    value: '4/5',
    icon: '🎯',
    progress: 80,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    title: 'XP Earned',
    value: '+340',
    icon: '⚡',
    progress: 68,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 4,
    title: 'Level Progress',
    value: 'Level 12',
    icon: '📈',
    progress: 45,
    color: 'from-green-500 to-emerald-500',
  },
];

export const mockTodaysQuests = [
  {
    id: 1,
    title: 'Complete code review for Project Alpha',
    completed: true,
    xp: 50,
    priority: 'high',
  },
  {
    id: 2,
    title: 'Update sprint board and move tickets',
    completed: true,
    xp: 25,
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Schedule 1:1 with team members',
    completed: false,
    xp: 30,
    priority: 'medium',
  },
  {
    id: 4,
    title: 'Write documentation for new API endpoint',
    completed: false,
    xp: 75,
    priority: 'high',
  },
  {
    id: 5,
    title: 'Review and merge pending pull requests',
    completed: false,
    xp: 40,
    priority: 'low',
  },
];

export const mockRecentActivity = [
  {
    id: 1,
    user: 'Sarah Chen',
    action: 'completed quest',
    target: 'Daily standup notes',
    time: '2 hours ago',
    icon: '✅',
  },
  {
    id: 2,
    user: 'Mike Johnson',
    action: 'earned badge',
    target: 'Code Ninja',
    time: '4 hours ago',
    icon: '🏅',
  },
  {
    id: 3,
    user: 'Emma Davis',
    action: 'started new project',
    target: 'Mobile App Redesign',
    time: '6 hours ago',
    icon: '🚀',
  },
  {
    id: 4,
    user: 'Alex Rivera',
    action: 'reached milestone',
    target: 'Level 12',
    time: '1 day ago',
    icon: '🎉',
  },
  {
    id: 5,
    user: 'Team Alpha',
    action: 'completed sprint',
    target: 'Sprint 24',
    time: '1 day ago',
    icon: '📦',
  },
];

export const mockStatsCards = [
  {
    title: 'Total Tasks',
    value: mockStats.totalTasks,
    change: '+12%',
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Completed Today',
    value: mockStats.completedToday,
    change: '+8%',
    icon: '✅',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Current Streak',
    value: `${mockStats.streak} days`,
    change: '🔥',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'Total Points',
    value: mockStats.points.toLocaleString(),
    change: '+340',
    icon: '⭐',
    color: 'from-purple-500 to-purple-600',
  },
];
