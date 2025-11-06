
"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, Repeat, Flame, Calendar as CalendarIcon, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { Progress } from "@/components/ui/progress";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useToast } from "@/hooks/use-toast";

export default function DhikrTracker({ className }: ComponentProps<'div'>) {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formattedDate = useFormattedDate(selectedDate);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const dateKey = selectedDate.toISOString().split('T')[0];

  const dhikrRecordRef = useMemoFirebase(() =>
    user ? doc(firestore, 'guest_users', user.uid, 'dhikr_records', dateKey) : null,
    [user, firestore, dateKey]
  );

  const { data: dhikrRecord } = useDoc<{count: number, goal: number}>(dhikrRecordRef);

  useEffect(() => {
    if (dhikrRecord) {
      setCount(dhikrRecord.count || 0);
      const newGoal = dhikrRecord.goal || 1000;
      if(newGoal < 1000) {
        setGoal(1000);
        if (isToday) updateDhikrRecord(dhikrRecord.count, 1000);
      } else {
        setGoal(newGoal);
      }
    } else {
        if (!user) {
            const localHistoryStr = localStorage.getItem('dhikrHistory');
            const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};
            const record = localHistory[selectedDate.toDateString()];
            
            if (record) {
              setCount(record.count || 0);
              const parsedGoal = record.goal || 1000;
              if (parsedGoal < 1000) {
                setGoal(1000);
                if (isToday) {
                  localHistory[selectedDate.toDateString()].goal = 1000;
                  localStorage.setItem('dhikrHistory', JSON.stringify(localHistory));
                }
              } else {
                setGoal(parsedGoal);
              }
            } else {
              setCount(0);
              setGoal(1000);
            }
        } else {
            setCount(0);
            setGoal(1000);
        }
    }
  }, [dhikrRecord, user, selectedDate, isToday]);

  const updateDhikrRecord = (newCount: number, newGoal?: number) => {
    if (!isToday) return; // Only allow updates for today

    const finalGoal = newGoal ?? goal;
    if (user && dhikrRecordRef) {
      const dataToSet = {
        count: newCount,
        goal: finalGoal,
        date: new Date().toISOString().split('T')[0],
        guestUserId: user?.uid,
        dhikrName: 'General'
      };
      setDocumentNonBlocking(dhikrRecordRef, dataToSet, { merge: true });
    } else {
        const localHistoryStr = localStorage.getItem('dhikrHistory');
        const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};
        if (!localHistory[selectedDate.toDateString()]) {
          localHistory[selectedDate.toDateString()] = {};
        }
        localHistory[selectedDate.toDateString()].count = newCount;
        localHistory[selectedDate.toDateString()].goal = finalGoal;
        localStorage.setItem('dhikrHistory', JSON.stringify(localHistory));
    }
    setCount(newCount);
    if(newGoal !== undefined) setGoal(newGoal);
  }

  const handleCustomAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isToday) return;
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount)) {
      updateDhikrRecord(count + amount);
      setCustomAmount("");
    }
  };
  
  const handleIncrement = () => {
    if (!isToday) return;
    updateDhikrRecord(count + 100);
  }

  const handleDecrement = () => {
    if (!isToday) return;
    updateDhikrRecord(Math.max(0, count - 100));
  }
  
  const handleReset = () => {
    if (!isToday) return;
    updateDhikrRecord(0);
  }

  const handleSave = () => {
    toast({
      title: "Progress Saved",
      description: `Your Dhikr goal for ${formattedDate} has been saved.`,
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };


  const progress = goal > 0 ? Math.min((count / goal) * 100, 100) : 0;

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-2xl flex items-center justify-between">
            Advanced Dhikr Goal
            <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Reset Dhikr count"><Repeat className="w-4 h-4 text-muted-foreground" /></Button>
          </CardTitle>
          <CardDescription>Minimum 1,000x remembrance a day.</CardDescription>
          <div className="flex items-center gap-2 mt-1">
              <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-7 w-7 rounded-full">
                  <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardDescription className="w-40 text-center">{formattedDate}</CardDescription>
                <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={isToday} className="h-7 w-7 rounded-full">
                  <ArrowRight className="h-4 w-4" />
              </Button>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleSave}>
                <Save className="h-5 w-5" />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <CalendarIcon className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                    />
                </PopoverContent>
            </Popover>
        </div>
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
                    <Button variant="outline" size="icon" onClick={handleIncrement} aria-label="Increment Dhikr count by 100" disabled={!isToday}><Plus /></Button>
                    <Button variant="outline" size="icon" onClick={handleDecrement} aria-label="Decrement Dhikr count by 100" disabled={!isToday}><Minus /></Button>
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
                    disabled={!isToday}
                  />
                  <Button type="submit" disabled={!isToday}>Add</Button>
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
