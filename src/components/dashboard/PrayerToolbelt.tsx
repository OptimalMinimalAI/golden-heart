"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, BookUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { SURAHS_CONTENT, type SurahContent } from '@/lib/surahs';

interface Surah {
    id: number;
    name: string;
    description: string;
    mastered: boolean;
}

const defaultSurahs: Surah[] = [
    { id: 1, name: "(1) Al-Fatiha", description: "The Opening", mastered: false },
    { id: 113, name: "(113) Al-Falaq", description: "The Daybreak", mastered: false },
];

export default function PrayerToolbelt({ className }: ComponentProps<'div'>) {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [selectedSurah, setSelectedSurah] = useState<SurahContent | null>(null);
    
    useEffect(() => {
        setIsClient(true);
        const savedSurahs = localStorage.getItem('prayerToolbeltSurahs');
        if (savedSurahs) {
            try {
                const parsedSurahs = JSON.parse(savedSurahs);
                // Basic validation to ensure we don't crash on bad data
                if (Array.isArray(parsedSurahs) && parsedSurahs.every(s => 'id' in s && 'name' in s)) {
                    setSurahs(parsedSurahs);
                } else {
                    setSurahs(defaultSurahs);
                }
            } catch(e) {
                setSurahs(defaultSurahs);
            }
        } else {
            setSurahs(defaultSurahs);
        }
    }, []);

    useEffect(() => {
        if(isClient) {
            localStorage.setItem('prayerToolbeltSurahs', JSON.stringify(surahs));
        }
    }, [surahs, isClient]);

    const handleMasteredToggle = (surahId: number) => {
        setSurahs(surahs.map(s => s.id === surahId ? { ...s, mastered: !s.mastered } : s));
    };

    const handleDeleteSurah = (surahId: number) => {
        setSurahs(surahs.filter(s => s.id !== surahId));
        toast({
            title: "Surah Removed",
            description: "The Surah has been removed from your toolbelt.",
        });
    };
    
    const handleAddSurah = () => {
        // This is a placeholder. A real implementation would have a dialog
        // to search and add surahs.
        const newId = Math.max(0, ...surahs.map(s => s.id)) + 1;
        const newSurah: Surah = {
            id: newId,
            name: `(${newId}) New Surah`,
            description: "New Description",
            mastered: false
        };
        setSurahs([...surahs, newSurah]);
        toast({
            title: "Surah Added",
            description: "A new surah has been added for you to customize.",
        });
    };
    
    const openSurahDialog = (surahId: number) => {
        const surahContent = SURAHS_CONTENT.find(s => s.id === surahId);
        if (surahContent) {
            setSelectedSurah(surahContent);
        }
    }

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
                    <Accordion type="multiple" className="w-full space-y-2 flex-grow">
                        {surahs.map((surah) => (
                            <AccordionItem value={`item-${surah.id}`} key={surah.id} className="bg-secondary/30 rounded-lg border-b-0 px-4">
                                <div className='flex justify-between items-center w-full'>
                                    <AccordionTrigger className="hover:no-underline py-3 flex-1" onClick={() => openSurahDialog(surah.id)}>
                                        <div>
                                            <p className="font-bold text-lg text-left">{surah.name}</p>
                                            <p className="text-muted-foreground text-sm text-left">{surah.description}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); handleDeleteSurah(surah.id); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <AccordionContent>
                                    <div className="flex items-center space-x-2 pt-2 pb-4 border-t border-border/50">
                                        <Checkbox id={`mastered-${surah.id}`} checked={surah.mastered} onCheckedChange={() => handleMasteredToggle(surah.id)} />
                                        <label
                                            htmlFor={`mastered-${surah.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Mastered
                                        </label>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                     <Button onClick={handleAddSurah} variant="outline" className="mt-4">
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
                                <p className="font-headline text-3xl text-primary/80" dir="rtl">{selectedSurah.arabicName}</p>
                            </div>
                        </DialogHeader>
                        <ScrollArea className="flex-grow pr-6 -mr-6">
                            <div className="space-y-4">
                                {selectedSurah.verses.map((verse) => (
                                    <div key={verse.id} className="p-4 rounded-lg bg-secondary/40 border border-border/50">
                                        <p className="text-2xl font-headline text-right text-primary-foreground mb-4" dir="rtl">{verse.arabic}</p>
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
        </>
    )
}
