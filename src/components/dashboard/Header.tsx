import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';

const GoldenHeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
)

export default function Header({ className }: ComponentProps<'div'>) {
  return (
    <header className={cn("text-center py-4", className)}>
        <div className="flex items-center justify-center gap-4">
            <GoldenHeartIcon />
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground tracking-tight">
                Golden Heart Hub
            </h1>
        </div>
      <p className="mt-2 text-lg text-muted-foreground">
        A sanctuary for your daily spiritual practices.
      </p>
    </header>
  );
}
