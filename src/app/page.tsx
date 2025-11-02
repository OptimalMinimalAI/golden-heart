"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import PrayerTracker from "@/components/dashboard/PrayerTracker";
import DhikrTracker from "@/components/dashboard/DhikrTracker";
import AllahNames from "@/components/dashboard/AllahNames";
import DhikrMastery from "@/components/dashboard/DhikrMastery";
import { Skeleton } from "@/components/ui/skeleton";
import PrayerToolbelt from "@/components/dashboard/PrayerToolbelt";
import FoundationalLanguage from "@/components/dashboard/FoundationalLanguage";

const PRAYER_NAMES = ['Sub/Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];


export default function DashboardPage() {
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const savedPrayersRaw = localStorage.getItem('completedPrayers');
    const savedDate = localStorage.getItem('lastPrayerDate');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      // It's a new day, reset prayers
      localStorage.setItem('completedPrayers', '[]');
      setCompletedPrayers(new Set());
    } else {
      if (savedPrayersRaw) {
        try {
          const savedPrayers = JSON.parse(savedPrayersRaw);
          if (Array.isArray(savedPrayers)) {
            setCompletedPrayers(new Set(savedPrayers));
          }
        } catch (e) {
          console.error("Failed to parse saved prayers", e);
          setCompletedPrayers(new Set());
        }
      }
    }

    const savedStreak = localStorage.getItem('streak');
    const savedLastCompletionDate = localStorage.getItem('lastCompletionDate');
    setStreak(savedStreak ? parseInt(savedStreak, 10) : 0);
    setLastCompletionDate(savedLastCompletionDate);
  }, [isClient]);

  const handlePrayerToggle = (prayerName: string) => {
    const newCompletedPrayers = new Set(completedPrayers);
    if (newCompletedPrayers.has(prayerName)) {
      newCompletedPrayers.delete(prayerName);
    } else {
      newCompletedPrayers.add(prayerName);
    }
    setCompletedPrayers(newCompletedPrayers);

    localStorage.setItem('completedPrayers', JSON.stringify(Array.from(newCompletedPrayers)));
    localStorage.setItem('lastPrayerDate', new Date().toDateString());

    updateStreak(newCompletedPrayers.size);
  };

  const updateStreak = (completedCount: number) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    if (completedCount >= PRAYER_NAMES.length) {
        if (todayStr === lastCompletionDate) {
            return; // Already counted for today
        }

        let newStreak = 1;
        if (lastCompletionDate) {
            const lastDate = new Date(lastCompletionDate);
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            if (lastDate.toDateString() === yesterday.toDateString()) {
                newStreak = streak + 1;
            }
        }
        
        setStreak(newStreak);
        setLastCompletionDate(todayStr);
        localStorage.setItem('streak', newStreak.toString());
        localStorage.setItem('lastCompletionDate', todayStr);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-background min-h-screen">
        <header className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3">
             <Skeleton className="w-8 h-8 rounded-full" />
             <Skeleton className="h-7 w-96" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mt-6">
                    <Skeleton className="lg:col-span-4 h-96" />
                    <Skeleton className="lg:col-span-2 h-96" />
                    <Skeleton className="lg:col-span-4 h-96" />
                    <Skeleton className="lg:col-span-2 h-96" />
                    <Skeleton className="lg:col-span-3 h-96" />
                    <Skeleton className="lg:col-span-3 h-96" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <PrayerTracker
              prayers={PRAYER_NAMES}
              completedPrayers={completedPrayers}
              onTogglePrayer={handlePrayerToggle}
              streak={streak}
              className="lg:col-span-4"
            />
            <DhikrTracker className="lg:col-span-2" />
            <AllahNames className="lg:col-span-4" />
            <DhikrMastery className="lg:col-span-2" />
            <PrayerToolbelt className="lg:col-span-3" />
            <FoundationalLanguage className="lg:col-span-3" />
          </div>
        </div>
      </div>
    </main>
  );
}
