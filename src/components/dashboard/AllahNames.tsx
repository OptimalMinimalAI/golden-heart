
"use client";

import { useState } from 'react';
import { ALLAH_NAMES } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';
import { Textarea } from '../ui/textarea';
import { seekGuidance, type SeekGuidanceOutput } from '@/ai/flows/seek-guidance-flow';
import { Skeleton } from '../ui/skeleton';

const ITEMS_PER_PAGE = 11;

const SeekGuidance = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SeekGuidanceOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await seekGuidance({ prompt });
            setResult(response);
        } catch (err) {
            setError("Sorry, I couldn't get guidance at this moment. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-headline text-xl mb-1">Seek Guidance</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Describe a challenge (e.g., "I feel lost") or a quality you seek (e.g., "patience") to find a Name of Allah for reflection.
            </p>
            <form onSubmit={handleSubmit} className="relative">
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'patience' or 'I am struggling with doubt'"
                    className="pr-20"
                    rows={2}
                />
                <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" disabled={isLoading}>
                    <Sparkles className={cn(isLoading && 'animate-spin')} />
                </Button>
            </form>

            {isLoading && (
                 <div className="space-y-4 mt-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            )}
            
            {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

            {result && (
                <div className="mt-4 space-y-3">
                    {result.names.map((name) => (
                        <div key={name.id} className="bg-secondary/50 p-4 rounded-lg border border-border/50 animate-in fade-in-0 duration-500">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">{name.id}. {name.name}</p>
                                    <p className="text-muted-foreground text-sm mt-1">{name.en}</p>
                                </div>
                                <p className="font-headline text-2xl text-right text-primary" dir="rtl">{name.transliteration}</p>
                            </div>
                             <p className="text-sm mt-3 pt-3 border-t border-border/20 text-muted-foreground">
                                <Sparkles className="w-3 h-3 inline-block mr-2 text-primary/70"/>
                                {name.reasoning}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AllahNames({ className }: ComponentProps<'div'>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(ALLAH_NAMES.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNames = ALLAH_NAMES.slice(startIndex, endIndex);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BookOpen /> The 99 Names of Allah
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
            <div className="space-y-4">
            {currentNames.map((name) => (
                <div key={name.id} className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
                <div className="flex-1 pr-4">
                    <p className="font-bold text-lg">{name.id}. {name.name}</p>
                    <p className="text-muted-foreground text-sm mt-1">{name.en}</p>
                </div>
                <p className="font-headline text-2xl text-right text-primary" dir="rtl">{name.transliteration}</p>
                </div>
            ))}
            </div>
            <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 rounded-full bg-background/50 hover:bg-background/80 disabled:opacity-30"
            >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Previous Page</span>
            </Button>
            <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 rounded-full bg-background/50 hover:bg-background/80 disabled:opacity-30"
            >
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">Next Page</span>
            </Button>
        </div>
        <div className="text-center mt-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
        </div>

        <SeekGuidance />
      </CardContent>
    </Card>
  );
}
