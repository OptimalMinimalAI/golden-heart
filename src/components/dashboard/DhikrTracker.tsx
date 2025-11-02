"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { Flame } from "lucide-react";

export default function DhikrTracker({ className }: ComponentProps<'div'>) {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
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

  const handleCustomAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount)) {
      setCount(c => c + amount);
      setCustomAmount("");
    }
  };

  const progress = goal > 0 ? (count / goal) * 100 : 0;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
          Dhikr Tracker
          <Button variant="ghost" size="icon" onClick={() => setCount(0)} aria-label="Reset Dhikr count"><Repeat className="w-4 h-4 text-muted-foreground" /></Button>
        </CardTitle>
        <CardDescription>Minimum {goal.toLocaleString()}x remembrance a day.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 justify-between flex-grow">
          <div className="space-y-4">
            <div className="text-right">
                <span className="text-primary font-bold">{count.toLocaleString()}</span>
                <span className="text-muted-foreground">/{goal.toLocaleString()}</span>
            </div>
            <Slider 
                value={[progress]} 
                max={100}
                className="w-full"
            />
            <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCount(c => c + 1)} aria-label="Increment Dhikr count"><Plus /></Button>
                <Button variant="outline" size="icon" onClick={() => setCount(c => Math.max(0, c - 1))} aria-label="Decrement Dhikr count"><Minus /></Button>
            </div>
             <form onSubmit={handleCustomAmountSubmit} className="flex gap-2 pt-4">
              <Input 
                id="dhikr-custom-amount"
                type="number" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Add custom amount"
                className="bg-card-foreground/5"
                aria-label="Custom Dhikr amount"
              />
              <Button type="submit">Add</Button>
            </form>
          </div>
          <div className="flex items-center justify-center gap-4 text-muted-foreground pt-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary/50"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
            <span className="text-sm">Day Streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
