import { cn } from '../utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800',
        className
      )}
    />
  );
}

export function VerseSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 space-y-3">
          <div className="flex justify-end">
            <Skeleton className="h-8 w-3/4" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
