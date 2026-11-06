'use client';

import { useState } from 'react';

interface UserAvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({
  name = 'User',
  avatar,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [prevAvatar, setPrevAvatar] = useState(avatar);
  const [imageError, setImageError] = useState(false);

  // Reset error state during render if the avatar prop changes
  if (avatar !== prevAvatar) {
    setPrevAvatar(avatar);
    setImageError(false);
  }

  // Compute initials fallback
  const initials = (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-extrabold',
  };

  const hasValidAvatar = Boolean(avatar && avatar.trim() && !imageError);

  if (hasValidAvatar) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatar!.trim()}
        alt={name || 'User avatar'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-border/80 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name || 'User initials'}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md shadow-blue-500/20 shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
}
