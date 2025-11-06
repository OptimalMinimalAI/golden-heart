
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ComponentProps } from 'react';
import { cn } from "@/lib/utils";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { Flame, Calendar as CalendarIcon, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import type { PrayerHistory } from "@/app/page";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

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
  const mainPrayerCount = 5;

  const handleSave = () => {
    toast({
      title: "Progress Saved",
      description: `Your prayer entries for ${formattedDate} have been saved.`,
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateSelect(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateSelect(newDate);
  };

  const completedDays = Object.keys(prayerHistory).filter(dateStr => {
    return prayerHistory[dateStr].length >= mainPrayerCount;
  }).map(dateStr => new Date(dateStr));
  
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle className="font-headline text-2xl flex items-center">Daily Prayer Counter</CardTitle>
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
                        onSelect={(date) => date && onDateSelect(date)}
                        initialFocus
                        modifiers={{ completed: completedDays }}
                        modifiersStyles={{
                            completed: { 
                                position: 'relative',
                            }
                        }}
                        disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        components={{
                            DayContent: (props) => {
                                const prayersForDay = prayerHistory[props.date.toDateString()] || [];
                                const prayerCount = prayersForDay.length;
                                
                                return (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <span>{props.date.getDate()}</span>
                                        {prayerCount > 0 && 
                                            <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1.5 h-auto leading-tight rounded-full">
                                                {prayerCount}
                                            </Badge>
                                        }
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
                <span className="text-muted-foreground">/{mainPrayerCount}</span>
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
