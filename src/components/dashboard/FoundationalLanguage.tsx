
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALPHABET } from "@/lib/data";
import { ArrowLeft, ArrowRight, BookText, HelpCircle, Volume2, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AlphabetQuiz from './AlphabetQuiz';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

export type QuizType = 'letter-to-transliteration' | 'transliteration-to-letter' | 'letter-to-name' | 'name-to-letter';

export interface QuizSummary {
    lastScore: number | null;
    lastAttempted: Date | null;
}

export default function FoundationalLanguage({ className }: ComponentProps<'div'>) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isQuizTypeDialogOpen, setIsQuizTypeDialogOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % ALPHABET.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    }

    const startQuiz = (type: QuizType) => {
        setIsQuizTypeDialogOpen(false);
        setActiveQuiz(type);
    }
    
    const handleQuizClose = () => {
        setActiveQuiz(null);
    }

    const handlePronounce = async (text: string) => {
        if (isSpeaking) return;

        setIsSpeaking(true);
        try {
            const { audioDataUri } = await textToSpeech({ text });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => setIsSpeaking(false);
            }
        } catch (error) {
            console.error("Error generating speech:", error);
            toast({
                variant: 'destructive',
                title: "Speech Error",
                description: "Could not generate pronunciation."
            });
            setIsSpeaking(false);
        }
    }


    const currentLetter = ALPHABET[currentIndex];

    return (
        <>
            <Card className={cn("h-full flex flex-col", className)}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookText /> Foundational Language
                    </CardTitle>
                    <CardDescription>Learn the alphabet through sacred words. Click a card to see its forms.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow items-center justify-between">
                    <div className="w-full flex-grow flex items-center justify-center relative [perspective:1000px]">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 z-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Previous Letter</span>
                        </Button>

                        <div className={cn("relative w-[450px] h-[350px] transition-transform duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
                            {/* Front of Card */}
                            <div onClick={handleFlip} className="absolute w-full h-full p-6 bg-secondary/30 rounded-lg flex flex-col justify-center items-center cursor-pointer [backface-visibility:hidden]">
                                <button onClick={(e) => { e.stopPropagation(); handlePronounce(currentLetter.name) }} className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'>
                                    {isSpeaking ? <Loader className='w-4 h-4 animate-spin' /> : <Volume2 className='w-4 h-4' />}
                                    {currentLetter.transliteration}
                                </button>
                                <p className="font-headline text-8xl my-4 text-white">{currentLetter.letter}</p>
                                <p className="font-bold text-2xl text-primary">{currentLetter.name}</p>
                                <div className="border-t border-border/50 w-1/2 my-4"></div>
                                <p className="font-headline text-3xl text-primary" dir="rtl">{currentLetter.exampleWord}</p>
                                <p className="font-semibold text-lg">{currentLetter.exampleTranslation}</p>
                                <p className="text-muted-foreground text-sm">"{currentLetter.exampleMeaning}"</p>
                            </div>
                            {/* Back of Card */}
                            <div onClick={handleFlip} className="absolute w-full h-full p-6 bg-secondary/50 rounded-lg flex flex-col justify-center items-center cursor-pointer [transform:rotateY(180deg)] [backface-visibility:hidden] space-y-4">
                               <div className='text-center'>
                                    <p className='text-sm text-muted-foreground'>Isolated</p>
                                    <p className='font-headline text-7xl'>{currentLetter.forms.isolated}</p>
                               </div>
                               <div className='flex justify-around w-full' dir="rtl">
                                    <div className='text-center'>
                                        <p className='text-sm text-muted-foreground'>Beginning</p>
                                        <p className='font-headline text-7xl'>{currentLetter.forms.initial}</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-sm text-muted-foreground'>Middle</p>
                                        <p className='font-headline text-7xl'>{currentLetter.forms.medial}</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-sm text-muted-foreground'>End</p>
                                        <p className='font-headline text-7xl'>{currentLetter.forms.final}</p>
                                    </div>
                               </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 z-10"
                            >
                            <ArrowRight className="h-5 w-5" />
                            <span className="sr-only">Next Letter</span>
                        </Button>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => setIsQuizTypeDialogOpen(true)}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Take a Quiz
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isQuizTypeDialogOpen} onOpenChange={setIsQuizTypeDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Choose Quiz Type</DialogTitle>
                        <DialogDescription>
                            Select how you'd like to be tested on the Arabic alphabet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className='border-r pr-4'>
                            <h3 className="font-semibold mb-2 text-center text-muted-foreground">Multiple Choice</h3>
                             <Button variant="secondary" className="w-full justify-between h-14 text-base px-4 mb-2" onClick={() => startQuiz('letter-to-transliteration')}>
                                Letter → Transliteration
                                <Badge variant="outline">Easy</Badge>
                            </Button>
                             <Button variant="secondary" className="w-full justify-between h-14 text-base px-4" onClick={() => startQuiz('transliteration-to-letter')}>
                                Transliteration → Letter
                                <Badge variant="outline">Easy</Badge>
                            </Button>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2 text-center text-muted-foreground">Typing Test</h3>
                             <Button variant="secondary" className="w-full justify-between h-14 text-base px-4 mb-2" onClick={() => startQuiz('letter-to-name')}>
                                Letter → Name
                                <Badge>Hard</Badge>
                            </Button>
                             <Button variant="secondary" className="w-full justify-between h-14 text-base px-4" onClick={() => startQuiz('name-to-letter')}>
                                Name → Letter
                                <Badge>Hard</Badge>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {activeQuiz && (
                <AlphabetQuiz 
                    quizType={activeQuiz}
                    onClose={handleQuizClose}
                />
            )}
            <audio ref={audioRef} className="hidden" />
        </>
    )
}
