"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from 'react';
import { cn } from "@/lib/utils";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Flame } from "lucide-react";

const PrayerStarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      "w-16 h-16 transition-colors duration-300",
      filled ? "fill-primary text-primary" : "text-muted-foreground/50"
    )}
  >
    <path d="M12 2l2.94 8.06L23 10.5l-6.5 5.69 1.94 8.81L12 20.25l-6.44 4.75 1.94-8.81L1 10.5l8.06-.44L12 2z" />
  </svg>
);


interface PrayerTrackerProps extends ComponentProps<'div'> {
  prayers: string[];
  completedPrayers: Set<string>;
  onTogglePrayer: (prayer: string) => void;
  streak: number;
}

export default function PrayerTracker({ prayers, completedPrayers, onTogglePrayer, streak, className }: PrayerTrackerProps) {
  const formattedDate = useFormattedDate();
  
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">Daily Prayer Counter</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow items-center justify-between">
        <div className="w-full">
            <div className="flex justify-around items-start text-center mb-8">
            {prayers.map((prayer) => {
                const isCompleted = completedPrayers.has(prayer);
                return (
                <button
                    key={prayer}
                    onClick={() => onTogglePrayer(prayer)}
                    className="flex flex-col items-center gap-2 group"
                    aria-pressed={isCompleted}
                >
                    <PrayerStarIcon filled={isCompleted} />
                    <span className={cn(
                        "font-medium text-sm transition-colors",
                        isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>{prayer}</span>
                </button>
                );
            })}
            </div>
        </div>

        <div className="text-center space-y-2">
            <p className="text-4xl font-bold">
                <span className="text-primary">{completedPrayers.size}</span>
                <span className="text-muted-foreground">/{prayers.length}</span>
            </p>
            <p className="text-muted-foreground text-sm">"Constant remembrance... destroys all illusions."</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-muted-foreground pt-8">
             <Flame className={cn("w-6 h-6", streak > 0 ? "text-primary" : "text-primary/50" )} />
             <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
            <span className="text-sm">Day Streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
