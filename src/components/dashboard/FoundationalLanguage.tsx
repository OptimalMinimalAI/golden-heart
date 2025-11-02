"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALPHABET } from "@/lib/data";
import { ArrowLeft, ArrowRight, BookText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export default function FoundationalLanguage({ className }: ComponentProps<'div'>) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % ALPHABET.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);
    };

    const currentLetter = ALPHABET[currentIndex];

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BookText /> Foundational Language
                </CardTitle>
                <CardDescription>Learn the alphabet through sacred words.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow items-center justify-between">
                <div className="text-center w-full relative p-6 bg-secondary/30 rounded-lg flex-grow flex flex-col justify-center items-center">
                    <div className="absolute top-2 left-2">
                        <Button variant="ghost" size="icon" onClick={handlePrev}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                        <Button variant="ghost" size="icon" onClick={handleNext}>
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentLetter.transliteration}</p>
                    <p className="font-headline text-8xl my-4 text-primary-foreground">{currentLetter.letter}</p>
                    <p className="font-bold text-2xl text-primary">{currentLetter.name}</p>
                    <div className="border-t border-border w-1/2 my-4"></div>
                    <p className="font-headline text-3xl text-primary/80" dir="rtl">{currentLetter.exampleWord}</p>
                    <p className="font-semibold text-lg">{currentLetter.exampleTranslation}</p>
                    <p className="text-muted-foreground">"{currentLetter.exampleMeaning}"</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Take a Quiz
                </Button>
            </CardContent>
        </Card>
    )
}
