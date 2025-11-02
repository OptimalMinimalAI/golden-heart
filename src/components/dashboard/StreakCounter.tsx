import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';

interface StreakCounterProps extends ComponentProps<'div'> {
  streak: number;
}

export default function StreakCounter({ streak, className }: StreakCounterProps) {
  return (
    <Card className={cn("h-full flex flex-col items-center justify-center text-center", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-headline text-xl">Day Streak</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-1 pt-0">
        <Flame className="w-20 h-20 text-primary drop-shadow-[0_2px_10px_rgba(212,175,55,0.7)]" />
        <p className="text-6xl font-bold text-accent">{streak}</p>
        <p className="text-muted-foreground -mt-2">{streak === 1 ? "day" : "days"}</p>
      </CardContent>
    </Card>
  );
}
