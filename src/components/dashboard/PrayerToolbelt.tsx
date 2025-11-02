"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, BookUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { SURAHS_CONTENT, type SurahContent } from '@/lib/surahs';
import { ALL_SURAHS, type SurahMeta } from '@/lib/all-surahs';
import { Input } from '../ui/input';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

interface Surah {
    id: number;
    name: string;
    description: string;
    mastered: boolean;
    guestUserId: string;
}

export default function PrayerToolbelt({ className }: ComponentProps<'div'>) {
    const { toast } = useToast();
    const [selectedSurah, setSelectedSurah] = useState<SurahContent | null>(null);
    const [isAddSurahDialogOpen, setIsAddSurahDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { user } = useUser();
    const firestore = useFirestore();

    const toolbeltRef = useMemoFirebase(() => 
      user ? collection(firestore, 'guest_users', user.uid, 'prayer_toolbelt') : null,
      [firestore, user]
    );

    const { data: surahs, isLoading } = useCollection<Surah>(toolbeltRef);

    const handleMasteredToggle = (surah: Surah) => {
        if (!toolbeltRef) return;
        const surahDocRef = doc(toolbeltRef, String(surah.id));
        setDocumentNonBlocking(surahDocRef, { mastered: !surah.mastered }, { merge: true });
    };

    const handleDeleteSurah = (surahId: number) => {
        if (!toolbeltRef) return;
        const surahDocRef = doc(toolbeltRef, String(surahId));
        deleteDocumentNonBlocking(surahDocRef);
        toast({
            title: "Surah Removed",
            description: "The Surah has been removed from your toolbelt.",
        });
    };
    
    const handleAddSurah = (surahToAdd: SurahMeta) => {
        if (!toolbeltRef || !user) return;

        if (surahs?.some(s => s.id === surahToAdd.id)) {
            toast({
                variant: "destructive",
                title: "Surah Already Exists",
                description: `${surahToAdd.name} is already in your toolbelt.`,
            });
            return;
        }

        const newSurah: Omit<Surah, 'id'> = {
            name: `(${surahToAdd.id}) ${surahToAdd.name}`,
            description: surahToAdd.translation,
            mastered: false,
            guestUserId: user.uid,
        };
        const surahDocRef = doc(toolbeltRef, String(surahToAdd.id));
        setDocumentNonBlocking(surahDocRef, newSurah, { merge: true });
        toast({
            title: "Surah Added",
            description: `${surahToAdd.name} has been added to your toolbelt.`,
        });
    };
    
    const openSurahDialog = (surahId: number) => {
        const surahContent = SURAHS_CONTENT.find(s => s.id === surahId);
        if (surahContent) {
            setSelectedSurah(surahContent);
        } else {
            toast({
                variant: "destructive",
                title: "Content not available",
                description: "The full content for this Surah is not yet available in the app."
            })
        }
    }

    const filteredSurahs = ALL_SURAHS.filter(surah =>
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.arabic.includes(searchQuery) ||
        String(surah.id).includes(searchQuery)
    );

    const sortedSurahs = surahs ? [...surahs].sort((a,b) => a.id - b.id) : [];

    return (
        <>
            <Card className={cn("h-full flex flex-col", className)}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookUp /> Prayer Toolbelt
                    </CardTitle>
                    <CardDescription>Quick access to important Surahs/Ayats for mastery.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                    <ScrollArea className='flex-grow pr-4 -mr-4'>
                        <div className="space-y-4">
                            {isLoading && <p className="text-muted-foreground text-sm">Loading toolbelt...</p>}
                            {!isLoading && sortedSurahs.map((surah) => (
                                <div key={surah.id} className="bg-secondary/30 rounded-lg p-4 flex flex-col">
                                    <div onClick={() => openSurahDialog(surah.id)} className="cursor-pointer flex-grow">
                                        <p className="font-bold text-lg">{surah.name}</p>
                                        <p className="text-muted-foreground text-sm">{surah.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/20">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id={`mastered-${surah.id}`} checked={surah.mastered} onCheckedChange={() => handleMasteredToggle(surah)} />
                                            <label
                                                htmlFor={`mastered-${surah.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Mastered
                                            </label>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 h-auto w-auto px-1" onClick={(e) => { e.stopPropagation(); handleDeleteSurah(surah.id); }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                             {!isLoading && sortedSurahs.length === 0 && <p className="text-sm text-muted-foreground text-center pt-8">{user ? "No Surahs added yet." : "Please log in as a guest to use the toolbelt."}</p>}
                        </div>
                    </ScrollArea>
                     <Button onClick={() => setIsAddSurahDialogOpen(true)} variant="outline" className="mt-4" disabled={!user}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Surah
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSurah} onOpenChange={(isOpen) => !isOpen && setSelectedSurah(null)}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                    {selectedSurah && (
                        <>
                        <DialogHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="text-2xl font-headline">{selectedSurah.name}</DialogTitle>
                                    <DialogDescription>{selectedSurah.translation}</DialogDescription>
                                </div>
                                <p className="font-headline text-3xl text-primary" dir="rtl">{selectedSurah.arabicName}</p>
                            </div>
                        </DialogHeader>
                        <ScrollArea className="flex-grow pr-6 -mr-6">
                            <div className="space-y-4">
                                {selectedSurah.verses.map((verse) => (
                                    <div key={verse.id} className="p-4 rounded-lg bg-secondary/40 border border-border/50">
                                        <p className="text-2xl font-headline text-right text-primary mb-4" dir="rtl">{verse.arabic}</p>
                                        <p className="font-semibold text-primary">{verse.transliteration}</p>
                                        <p className="text-muted-foreground mt-1">{verse.id}. {verse.translation}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>

             <Dialog open={isAddSurahDialogOpen} onOpenChange={setIsAddSurahDialogOpen}>
                <DialogContent className="max-w-md h-[70vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add Surah to Toolbelt</DialogTitle>
                        <DialogDescription>Search for a Surah to add to your quick access list.</DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, number, or Arabic..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="flex-grow -mx-6">
                        <div className="px-6">
                        {filteredSurahs.map((surah) => (
                            <div key={surah.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
                                <div>
                                    <p className="font-bold">({surah.id}) {surah.name}</p>
                                    <p className="text-sm text-muted-foreground">{surah.translation}</p>
                                </div>
                                <div className='text-right'>
                                     <p className="font-headline text-xl text-primary" dir="rtl">{surah.arabic}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handleAddSurah(surah)}>
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}
