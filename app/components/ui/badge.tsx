import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80 focus:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/80 focus:ring-destructive',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-accent',
        success:
          'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
        ghost:
          'bg-muted text-muted-foreground hover:bg-muted/80 focus:ring-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
