
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenSquare, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { ScrollArea } from "../ui/scroll-area";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";

interface Dhikr {
  id: string;
  name: string;
  guestUserId?: string;
}

export default function DhikrMastery({ className }: ComponentProps<'div'>) {
  const [newDhikr, setNewDhikr] = useState("");
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [localDhirs, setLocalDhikrs] = useState<Dhikr[]>([]);

  const dhikrsRef = useMemoFirebase(() => 
    user ? collection(firestore, 'guest_users', user.uid, 'dhikrs') : null,
    [firestore, user]
  );
  
  const { data: firestoreDhikrs, isLoading } = useCollection<Dhikr>(dhikrsRef);

  useEffect(() => {
    if (!user) {
        const storedDhikrs = localStorage.getItem('dhikrs');
        if (storedDhikrs) {
            setLocalDhikrs(JSON.parse(storedDhikrs));
        }
    }
  }, [user]);

  const dhikrs = user ? firestoreDhikrs : localDhirs;

  const handleAddDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDhikr = newDhikr.trim();
    if (!trimmedDhikr) return;

    if (user && dhikrsRef) {
      const dhikrData = {
        name: trimmedDhikr,
        guestUserId: user.uid,
        arabicText: '', 
        translation: '',
      };
      addDocumentNonBlocking(dhikrsRef, dhikrData);
    } else {
        const newDhikrItem: Dhikr = { id: new Date().toISOString(), name: trimmedDhikr };
        const updatedDhikrs = [...localDhirs, newDhikrItem];
        setLocalDhikrs(updatedDhikrs);
        localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
    }

    setNewDhikr("");
    toast({
      title: "Dhikr Added",
      description: "Your new Dhikr for study has been saved.",
    });
  };
  
  const handleDeleteDhikr = (id: string) => {
    if (user && dhikrsRef) {
      deleteDocumentNonBlocking(doc(dhikrsRef, id));
    } else {
        const updatedDhikrs = localDhirs.filter(d => d.id !== id);
        setLocalDhikrs(updatedDhikrs);
        localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
    }
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <PenSquare /> Dhikr Mastery
        </CardTitle>
        <CardDescription>Manually input Dhikrs for study.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <form onSubmit={handleAddDhikr} className="flex gap-2 mb-4">
          <Input
            value={newDhikr}
            onChange={(e) => setNewDhikr(e.target.value)}
            placeholder="e.g., Subhanallah"
          />
          <Button type="submit" size="icon" aria-label="Add Dhikr"><Plus /></Button>
        </form>
        <ScrollArea className="flex-grow">
            <ul className="space-y-2 pr-4">
            {isLoading && user && <p className="text-sm text-muted-foreground text-center pt-8">Loading Dhikrs...</p>}
            {dhikrs?.map((dhikr) => (
                <li key={dhikr.id} className="flex items-center justify-between bg-secondary/50 p-3 rounded-md animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <span className="text-secondary-foreground">{dhikr.name}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDhikr(dhikr.id)} aria-label={`Delete ${dhikr.name}`}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
                </li>
            ))}
            {!isLoading && (!dhikrs || dhikrs.length === 0) && <p className="text-sm text-muted-foreground text-center pt-8">No Dhikrs added yet.</p>}
            </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
