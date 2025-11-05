
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
import { useUser, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection, doc, getDoc, setDoc, query, where, getDocs, serverTimestamp, deleteDoc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

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
  const auth = useAuth();
  const { toast } = useToast();

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
    if (auth && isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            toast({
              title: "Signed In Successfully",
              description: `Welcome back, ${result.user.email}!`,
            });
            // You can access the user's info with result.user
          })
          .catch((error) => {
             console.error("Error signing in with email link:", error);
             toast({
                variant: 'destructive',
                title: "Sign-in Failed",
                description: "The link may be expired or invalid. Please try again.",
             })
          });
      }
    }
  }, [auth, toast]);

  useEffect(() => {
    if (!isClient) return;

    const dateKey = selectedDate.toISOString().split('T')[0];

    if (user && prayerRecordsRef) {
      // User is logged in, fetch from Firestore
      const q = query(prayerRecordsRef, where("date", "==", dateKey));
      
      getDocs(q).then(querySnapshot => {
        const prayersForDate = new Set<string>();
        querySnapshot.forEach(doc => {
          const record = doc.data();
          prayersForDate.add(record.prayerType);
        });
        setCompletedPrayers(prayersForDate);
      });

      const allRecordsQuery = query(prayerRecordsRef);
      getDocs(allRecordsQuery).then(querySnapshot => {
          const historyUpdate: PrayerHistory = {};
          querySnapshot.forEach(doc => {
              const record = doc.data();
              const recordDate = new Date(record.date + 'T00:00:00');
              const recordDateKey = recordDate.toDateString();
              if (!historyUpdate[recordDateKey]) {
                  historyUpdate[recordDateKey] = [];
              }
              historyUpdate[recordDateKey].push(record.prayerType);
          });
          setPrayerHistory(historyUpdate);
      });
    } else {
      // User is not logged in, fetch from localStorage
      const localHistoryStr = localStorage.getItem('prayerHistory');
      const localHistory: PrayerHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};
      const prayersForDate = localHistory[selectedDate.toDateString()] || [];
      setCompletedPrayers(new Set(prayersForDate));
      setPrayerHistory(localHistory);
    }
    
  }, [isClient, user, selectedDate, prayerRecordsRef]);

  useEffect(() => {
    if (!isClient) return;
    
    if (user && dayStreakRef) {
        getDoc(dayStreakRef).then(docSnap => {
          if (docSnap.exists()) {
            const streakData = docSnap.data();
            setStreak(streakData.days || 0);
            setLastCompletionDate(streakData.endDate ? new Date(streakData.endDate + 'T00:00:00').toDateString() : null);
          }
        });
    } else {
        const localStreak = localStorage.getItem('streak');
        const localLastDate = localStorage.getItem('lastCompletionDate');
        setStreak(localStreak ? parseInt(localStreak, 10) : 0);
        setLastCompletionDate(localLastDate);
    }

  }, [isClient, user, dayStreakRef]);


  const handlePrayerToggle = (prayerName: string) => {
    const newCompletedPrayers = new Set(completedPrayers);
    
    if (newCompletedPrayers.has(prayerName)) {
      newCompletedPrayers.delete(prayerName);
    } else {
      newCompletedPrayers.add(prayerName);
    }
    setCompletedPrayers(newCompletedPrayers);
    
    const newHistory = { ...prayerHistory, [selectedDate.toDateString()]: Array.from(newCompletedPrayers) };
    setPrayerHistory(newHistory);
    
    if(user && prayerRecordsRef) {
        const dateKey = selectedDate.toISOString().split('T')[0];
        const prayerId = `${dateKey}_${prayerName}`;
        const prayerDocRef = doc(prayerRecordsRef, prayerId);
        
        if (completedPrayers.has(prayerName)) { // before toggle, so it's a delete operation
            deleteDocumentNonBlocking(prayerDocRef);
        } else {
            const prayerRecord = {
                id: prayerId,
                guestUserId: user.uid,
                prayerType: prayerName,
                completed: true,
                date: dateKey,
              };
            setDocumentNonBlocking(prayerDocRef, prayerRecord, { merge: true });
        }
    } else {
        localStorage.setItem('prayerHistory', JSON.stringify(newHistory));
    }


    if (selectedDate.toDateString() === new Date().toDateString()) {
      updateStreak(newCompletedPrayers);
    }
  };

  const updateStreak = (currentPrayers: Set<string>) => {
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

        if (user && dayStreakRef) {
            const streakData = {
              id: 'current',
              guestUserId: user.uid,
              startDate: serverTimestamp(),
              endDate: today.toISOString().split('T')[0],
              days: newStreak
            };
            setDocumentNonBlocking(dayStreakRef, streakData, { merge: true });
        } else {
            localStorage.setItem('streak', String(newStreak));
            localStorage.setItem('lastCompletionDate', todayStr);
        }
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <Skeleton className="lg:col-span-2 h-96" />
                    <Skeleton className="lg:col-span-1 h-96" />
                    <Skeleton className="lg:col-span-3 h-96" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PrayerTracker
              prayers={ALL_PRAYERS}
              completedPrayers={completedPrayers}
              onTogglePrayer={handlePrayerToggle}
              streak={streak}
              className="lg:col-span-2"
              prayerHistory={prayerHistory}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <DhikrTracker className="lg:col-span-1" />
            <AllahNames className="lg:col-span-3" />
            <DhikrMastery className="lg:col-span-3" />
            <PrayerToolbelt className="lg:col-span-3" />
            <FoundationalLanguage className="lg:col-span-3" />
          </div>
        </div>
      </div>
    </main>
  );
}
