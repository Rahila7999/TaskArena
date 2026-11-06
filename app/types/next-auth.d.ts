import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'Admin' | 'Manager' | 'Employee';
      avatar: string;
      xp: number;
      coins: number;
      level: number;
      streak: number;
      notificationPersonality:
        | 'Friendly'
        | 'Funny'
        | 'Savage'
        | 'Motivational'
        | 'NoMercy'
        | 'Corporate';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'Admin' | 'Manager' | 'Employee';
    avatar: string;
    xp: number;
    coins: number;
    level: number;
    streak: number;
    notificationPersonality:
      | 'Friendly'
      | 'Funny'
      | 'Savage'
      | 'Motivational'
      | 'NoMercy'
      | 'Corporate';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'Admin' | 'Manager' | 'Employee';
    avatar: string;
    xp: number;
    coins: number;
    level: number;
    streak: number;
    notificationPersonality:
      | 'Friendly'
      | 'Funny'
      | 'Savage'
      | 'Motivational'
      | 'NoMercy'
      | 'Corporate';
  }
}