
import React from 'react';
import { cn } from '../lib/utils';

/**
 * Update Skeleton component to accept standard HTML attributes including key prop.
 */
export const Skeleton = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md", className)} style={style} {...props} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-800">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
        <Skeleton className="w-16 h-4" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex items-end gap-2 px-4 py-8">
    {[...Array(12)].map((_, i) => (
      <Skeleton 
        key={i} 
        className="flex-1" 
        style={{ height: `${Math.random() * 80 + 20}%` }} 
      />
    ))}
  </div>
);
