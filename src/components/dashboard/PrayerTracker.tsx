"use client";

import { CheckCircle2, Circle, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from 'react';
import { cn } from "@/lib/utils";

const prayerIcons: { [key: string]: React.ReactNode } = {
  Fajr: <Sunrise className="h-5 w-5" />,
  Sunrise: <Sunrise className="h-5 w-5 text-amber-400" />,
  Dhuhr: <Sun className="h-5 w-5" />,
  Asr: <Sun className="h-5 w-5 opacity-70" />,
  Maghrib: <Sunset className="h-5 w-5" />,
  Isha: <Moon className="h-5 w-5" />,
};

interface PrayerTrackerProps extends ComponentProps<'div'> {
  prayers: string[];
  completedPrayers: Set<string>;
  onTogglePrayer: (prayer: string) => void;
}

export default function PrayerTracker({ prayers, completedPrayers, onTogglePrayer, className }: PrayerTrackerProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">Daily Prayers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prayers.map((prayer) => {
            const isCompleted = completedPrayers.has(prayer);
            return (
              <Button
                key={prayer}
                variant={isCompleted ? "default" : "secondary"}
                size="lg"
                className={cn("w-full justify-start text-lg", {
                  "bg-primary/20 text-primary-foreground hover:bg-primary/30": isCompleted
                })}
                onClick={() => onTogglePrayer(prayer)}
                aria-pressed={isCompleted}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 mr-3 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 mr-3 text-muted-foreground" />
                )}
                <span className="flex-1 text-left">{prayer}</span>
                {prayerIcons[prayer]}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
