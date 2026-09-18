export const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    default: 'bg-accent text-accent-foreground hover:bg-accent/90',
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    outline: 'border border-border bg-card hover:bg-muted',
    ghost: 'hover:bg-muted hover:text-foreground',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
