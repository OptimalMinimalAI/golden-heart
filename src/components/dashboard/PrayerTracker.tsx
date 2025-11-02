"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ComponentProps } from 'react';
import { cn } from "@/lib/utils";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Flame, Calendar as CalendarIcon, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import type { PrayerHistory } from "@/app/page";
import { useToast } from "@/hooks/use-toast";

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
  prayerHistory: PrayerHistory;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function PrayerTracker({ prayers, completedPrayers, onTogglePrayer, streak, prayerHistory, selectedDate, onDateSelect, className }: PrayerTrackerProps) {
  const formattedDate = useFormattedDate(selectedDate);
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const { toast } = useToast();

  const handleSave = () => {
    // The main logic in page.tsx already saves on toggle.
    // This button can provide user feedback.
    toast({
      title: "Progress Saved",
      description: "Your prayer entries for today have been saved.",
    });
  };

  const completedDays = Object.keys(prayerHistory).filter(dateStr => {
    return prayerHistory[dateStr].length >= prayers.length;
  }).map(dateStr => new Date(dateStr));
  
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="font-headline text-2xl flex items-center">Daily Prayer Counter</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {isToday && (
                 <Button variant="outline" size="icon" onClick={handleSave}>
                    <Save className="h-5 w-5" />
                 </Button>
            )}
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
                        onSelect={(date) => date && onDateSelect(date)}
                        initialFocus
                        modifiers={{ completed: completedDays }}
                        modifiersStyles={{
                            completed: { 
                                position: 'relative',
                            }
                        }}
                        components={{
                            DayContent: (props) => {
                                const isCompleted = completedDays.some(d => d.toDateString() === props.date.toDateString());
                                return (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <span>{props.date.getDate()}</span>
                                        {isCompleted && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </div>
                                )
                            }
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
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
                    className={cn("flex flex-col items-center gap-2 group", !isToday && "cursor-not-allowed opacity-70")}
                    aria-pressed={isCompleted}
                    disabled={!isToday}
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
            <span className="text-sm">{streak} Day Streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
