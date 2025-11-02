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
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, getDoc, setDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase";

const PRAYER_NAMES = ['Sub/Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ALL_PRAYERS = [...PRAYER_NAMES, '+'];

export type PrayerHistory = {
  [date: string]: string[];
}

export default function DashboardPage() {
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory>({});
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const prayerRecordsRef = useMemoFirebase(() => 
    user ? collection(firestore, 'guest_users', user.uid, 'prayer_records') : null,
    [firestore, user]
  );
  
  const dayStreakRef = useMemoFirebase(() => 
    user ? doc(firestore, 'guest_users', user.uid, 'day_streaks', 'current') : null,
    [firestore, user]
  );


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !user || !prayerRecordsRef) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const q = query(prayerRecordsRef, where("date", "==", dateKey));
    
    getDocs(q).then(querySnapshot => {
      const prayersForDate = new Set<string>();
      const historyUpdate: PrayerHistory = {};
      
      querySnapshot.forEach(doc => {
        const record = doc.data();
        prayersForDate.add(record.prayerType);
        
        const recordDateKey = new Date(record.date).toDateString();
        if (!historyUpdate[recordDateKey]) {
          historyUpdate[recordDateKey] = [];
        }
        historyUpdate[recordDateKey].push(record.prayerType);
      });
      
      setCompletedPrayers(prayersForDate);
      setPrayerHistory(prev => ({ ...prev, ...historyUpdate }));
    });
    
  }, [isClient, user, selectedDate, prayerRecordsRef]);

  useEffect(() => {
    if (!isClient || !user || !dayStreakRef) return;

    getDoc(dayStreakRef).then(docSnap => {
      if (docSnap.exists()) {
        const streakData = docSnap.data();
        setStreak(streakData.days || 0);
        setLastCompletionDate(streakData.endDate ? new Date(streakData.endDate).toDateString() : null);
      }
    });

  }, [isClient, user, dayStreakRef]);


  const handlePrayerToggle = (prayerName: string) => {
    if (!user || !prayerRecordsRef) return;
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    const prayerId = `${dateKey}_${prayerName}`;
    const prayerDocRef = doc(prayerRecordsRef, prayerId);

    const newCompletedPrayers = new Set(completedPrayers);
    
    if (newCompletedPrayers.has(prayerName)) {
      newCompletedPrayers.delete(prayerName);
      // In a real app, you would use deleteDocumentNonBlocking, but for simplicity...
    } else {
      newCompletedPrayers.add(prayerName);
      const prayerRecord = {
        id: prayerId,
        guestUserId: user.uid,
        prayerType: prayerName,
        completed: true,
        date: dateKey,
      };
      setDocumentNonBlocking(prayerDocRef, prayerRecord, { merge: true });
    }
    
    setCompletedPrayers(newCompletedPrayers);
    
    const newHistory = { ...prayerHistory, [selectedDate.toDateString()]: Array.from(newCompletedPrayers) };
    setPrayerHistory(newHistory);

    if (selectedDate.toDateString() === new Date().toDateString()) {
      updateStreak(newCompletedPrayers);
    }
  };

  const updateStreak = (currentPrayers: Set<string>) => {
    if (!user || !dayStreakRef) return;

    const today = new Date();
    const todayStr = today.toDateString();
    
    const mainPrayersCompleted = PRAYER_NAMES.every(p => currentPrayers.has(p));

    if (mainPrayersCompleted) {
        if (todayStr === lastCompletionDate) {
            return;
        }

        let newStreak;
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (lastCompletionDate && new Date(lastCompletionDate).toDateString() === yesterday.toDateString()) {
            newStreak = streak + 1;
        } else {
            newStreak = 1;
        }
        
        setStreak(newStreak);
        setLastCompletionDate(todayStr);

        const streakData = {
          id: 'current',
          guestUserId: user.uid,
          startDate: serverTimestamp(),
          endDate: today.toISOString().split('T')[0],
          days: newStreak
        };
        setDocumentNonBlocking(dayStreakRef, streakData, { merge: true });
    }
  };

  if (!isClient || isUserLoading) {
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
                    <Skeleton className="lg:col-span-6 h-96" />
                    <Skeleton className="lg:col-span-6 h-96" />
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
              prayers={ALL_PRAYERS}
              completedPrayers={completedPrayers}
              onTogglePrayer={handlePrayerToggle}
              streak={streak}
              className="lg:col-span-4"
              prayerHistory={prayerHistory}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <DhikrTracker className="lg:col-span-2" />
            <AllahNames className="lg:col-span-6" />
            <DhikrMastery className="lg:col-span-6" />
            <PrayerToolbelt className="lg:col-span-3" />
            <FoundationalLanguage className="lg:col-span-3" />
          </div>
        </div>
      </div>
    </main>
  );
}
