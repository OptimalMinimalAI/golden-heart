"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, Repeat, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';

export default function DhikrTracker({ className }: ComponentProps<'div'>) {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(100);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedCount = localStorage.getItem('dhikrCount');
    const savedGoal = localStorage.getItem('dhikrGoal');
    if (savedCount) setCount(parseInt(savedCount, 10));
    if (savedGoal) setGoal(parseInt(savedGoal, 10));
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('dhikrCount', String(count));
    }
  }, [count, isClient]);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('dhikrGoal', String(goal));
    }
  }, [goal, isClient]);


  const progress = goal > 0 ? (count / goal) * 100 : 0;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Repeat /> Dhikr Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 justify-center h-full">
        <div className="text-center">
            <p className="text-7xl font-bold text-primary">{count}</p>
            <p className="text-muted-foreground">/ {goal}</p>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="flex justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCount(c => Math.max(0, c - 1))} aria-label="Decrement Dhikr count"><Minus /></Button>
            <Button size="lg" onClick={() => setCount(c => c + 1)} className="w-24 h-14 text-2xl" aria-label="Increment Dhikr count"><Plus /></Button>
            <Button variant="destructive" size="icon" onClick={() => setCount(0)} aria-label="Reset Dhikr count"><Repeat className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <label htmlFor="dhikr-goal" className="text-sm font-medium whitespace-nowrap"><Target className="inline mr-1 h-4 w-4" />Set Goal:</label>
          <Input 
            id="dhikr-goal"
            type="number" 
            value={goal}
            onChange={(e) => setGoal(Math.max(0, parseInt(e.target.value) || 0))}
            className="max-w-28"
            aria-label="Dhikr goal"
          />
        </div>
      </CardContent>
    </Card>
  );
}
