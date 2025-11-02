
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenSquare, Plus, Trash2, Bot, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { ScrollArea } from "../ui/scroll-area";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";
import { enrichDhikr } from "@/ai/flows/dhikr-enrichment-flow";
import { Skeleton } from "../ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";

interface Dhikr {
  id: string;
  name: string; // The original user input
  arabicText?: string;
  translation?: string;
  transliteration?: string;
  guestUserId?: string;
}

export default function DhikrMastery({ className }: ComponentProps<'div'>) {
  const [newDhikr, setNewDhikr] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);
  const [newTranslation, setNewTranslation] = useState("");
  const [newTransliteration, setNewTransliteration] = useState("");

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [localDhikrs, setLocalDhikrs] = useState<Dhikr[]>([]);

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
  
  useEffect(() => {
    if (editingDhikr) {
      setNewTranslation(editingDhikr.translation || "");
      setNewTransliteration(editingDhikr.transliteration || "");
    }
  }, [editingDhikr]);

  const dhikrs = user ? firestoreDhikrs : localDhikrs;

  const handleAddDhikr = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDhikr = newDhikr.trim();
    if (!trimmedDhikr) return;

    setIsEnriching(true);

    try {
        const enrichedData = await enrichDhikr({ dhikr: trimmedDhikr });
        
        const dhikrData: Omit<Dhikr, 'id'> = {
            name: trimmedDhikr,
            arabicText: enrichedData.arabicText,
            translation: enrichedData.translation,
            transliteration: enrichedData.transliteration,
            guestUserId: user?.uid,
        };

        if (user && dhikrsRef) {
            addDocumentNonBlocking(dhikrsRef, dhikrData);
        } else {
            const newDhikrItem: Dhikr = { ...dhikrData, id: new Date().toISOString() };
            const updatedDhikrs = [...localDhikrs, newDhikrItem];
            setLocalDhikrs(updatedDhikrs);
            localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
        }

        setNewDhikr("");
        toast({
            title: "Dhikr Added & Enriched",
            description: "Your new Dhikr has been saved with its details.",
        });

    } catch (error) {
        console.error("Error enriching Dhikr:", error);
        toast({
            variant: "destructive",
            title: "Could not enrich Dhikr",
            description: "Unable to find details for the entered Dhikr. It has been saved as is.",
        });
        // Save without enrichment as a fallback
        const fallbackDhikr: Omit<Dhikr, 'id'> = { name: trimmedDhikr, guestUserId: user?.uid };
        if (user && dhikrsRef) {
            addDocumentNonBlocking(dhikrsRef, fallbackDhikr);
        } else {
             const newDhikrItem: Dhikr = { ...fallbackDhikr, id: new Date().toISOString() };
            const updatedDhikrs = [...localDhikrs, newDhikrItem];
            setLocalDhikrs(updatedDhikrs);
            localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
        }
        setNewDhikr("");
    } finally {
        setIsEnriching(false);
    }
  };
  
  const handleDeleteDhikr = (id: string) => {
    if (user && dhikrsRef) {
      deleteDocumentNonBlocking(doc(dhikrsRef, id));
    } else {
        const updatedDhikrs = localDhikrs.filter(d => d.id !== id);
        setLocalDhikrs(updatedDhikrs);
        localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
    }
  }

  const handleUpdateDhikr = () => {
    if (!editingDhikr) return;

    const updatedFields = {
      translation: newTranslation,
      transliteration: newTransliteration,
    };

    if (user && dhikrsRef) {
        const dhikrDocRef = doc(dhikrsRef, editingDhikr.id);
        setDocumentNonBlocking(dhikrDocRef, updatedFields, { merge: true });
    } else {
        const updatedDhikrs = localDhikrs.map(d => 
            d.id === editingDhikr.id ? { ...d, ...updatedFields } : d
        );
        setLocalDhikrs(updatedDhikrs);
        localStorage.setItem('dhikrs', JSON.stringify(updatedDhikrs));
    }

    toast({
        title: "Dhikr Updated",
    });
    setEditingDhikr(null);
  };

  const getDhikrDisplay = (dhikr: Dhikr) => {
      // Check if input was likely English
      const isEnglish = dhikr.name.toLowerCase() === dhikr.translation?.toLowerCase();
      if (isEnglish) return dhikr.transliteration;
      return dhikr.translation;
  }

  return (
    <>
      <Card className={cn("h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <PenSquare /> Dhikr Mastery
          </CardTitle>
          <CardDescription>Enter a Dhikr in English or transliteration to save it for study. AI will add the Arabic script and translation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <form onSubmit={handleAddDhikr} className="flex gap-2 mb-4">
            <div className="relative w-full">
              <Input
                value={newDhikr}
                onChange={(e) => setNewDhikr(e.target.value)}
                placeholder="e.g., Subhanallah or Glory be to Allah"
                disabled={isEnriching}
              />
              {isEnriching && <Bot className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-pulse" />}
            </div>
            <Button type="submit" size="icon" aria-label="Add Dhikr" disabled={isEnriching}><Plus /></Button>
          </form>
          <ScrollArea className="flex-grow">
              <ul className="space-y-2 pr-4">
              {(isLoading || isEnriching) && user && <Skeleton className="h-16 w-full" />}
              {dhikrs?.map((dhikr) => (
                  <li key={dhikr.id} className="flex items-start justify-between bg-secondary/50 p-3 rounded-md animate-in fade-in-0 slide-in-from-top-2 duration-300 group">
                    <div className="flex-1 pr-4">
                        <p className="font-semibold text-secondary-foreground">{dhikr.name}</p>
                        {dhikr.translation && <p className="text-sm text-muted-foreground">{getDhikrDisplay(dhikr)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {dhikr.arabicText && <p className="font-headline text-2xl text-primary text-right" dir="rtl">{dhikr.arabicText}</p>}
                      <Button variant="ghost" size="icon" onClick={() => setEditingDhikr(dhikr)} aria-label={`Edit ${dhikr.name}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDhikr(dhikr.id)} aria-label={`Delete ${dhikr.name}`}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </li>
              ))}
              {!isLoading && (!dhikrs || dhikrs.length === 0) && <p className="text-sm text-muted-foreground text-center pt-8">No Dhikrs added yet.</p>}
              </ul>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={!!editingDhikr} onOpenChange={(isOpen) => !isOpen && setEditingDhikr(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Dhikr</DialogTitle>
                <DialogDescription>
                    Update the details for "{editingDhikr?.name}".
                </DialogDescription>
            </DialogHeader>
            <div className="my-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="transliteration">Transliteration</Label>
                    <Input 
                        id="transliteration"
                        value={newTransliteration}
                        onChange={(e) => setNewTransliteration(e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="translation">Translation</Label>
                    <Input 
                        id="translation"
                        value={newTranslation}
                        onChange={(e) => setNewTranslation(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditingDhikr(null)}>Cancel</Button>
                <Button onClick={handleUpdateDhikr}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
