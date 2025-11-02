"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    
    if (savedGoal) {
        const savedGoalInt = parseInt(savedGoal, 10);
        if (savedGoalInt > 0) {
            setGoal(savedGoalInt);
        } else {
            setGoal(1000);
        }
    } else {
        setGoal(1000);
    }
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
  
  const handleIncrement = () => {
    setCount(c => c + 100);
  }

  const handleDecrement = () => {
    setCount(c => Math.max(0, c - 100));
  }

  const progress = goal > 0 ? (count / goal) * 100 : 0;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center justify-between">
          Advanced Dhikr Goal
          <Button variant="ghost" size="icon" onClick={() => setCount(0)} aria-label="Reset Dhikr count"><Repeat className="w-4 h-4 text-muted-foreground" /></Button>
        </CardTitle>
        <CardDescription>Minimum 1,000x remembrance a day.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 justify-between flex-grow">
          <div className="space-y-6">
            <div className="text-center">
                <span className="text-primary font-bold text-4xl">{count.toLocaleString()}</span>
                <span className="text-muted-foreground text-2xl">/{goal.toLocaleString()}</span>
            </div>

            <div>
              <Progress value={progress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>{goal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex justify-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleIncrement} aria-label="Increment Dhikr count by 100"><Plus /></Button>
                    <Button variant="outline" size="icon" onClick={handleDecrement} aria-label="Decrement Dhikr count by 100"><Minus /></Button>
                </div>
                 <form onSubmit={handleCustomAmountSubmit} className="flex gap-2 flex-grow">
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
          </div>
          <div className="flex items-center justify-center gap-4 text-muted-foreground pt-4">
             <Flame className="w-6 h-6 text-primary/50" />
             <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
            <span className="text-sm">Day Streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
