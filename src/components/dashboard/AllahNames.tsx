"use client";

import { useState } from 'react';
import { ALLAH_NAMES } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';

const ITEMS_PER_PAGE = 11;

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BookOpen /> The 99 Names of Allah
        </CardTitle>
        <span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
      </CardHeader>
      <CardContent className="relative">
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
        
        <div className="absolute inset-x-0 bottom-0 flex justify-center pt-4">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    className="rounded-full bg-background/50 hover:bg-background/80 disabled:opacity-30"
                    >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Previous Page</span>
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="rounded-full bg-background/50 hover:bg-background/80 disabled:opacity-30"
                    >
                    <ArrowRight className="h-5 w-5" />
                    <span className="sr-only">Next Page</span>
                </Button>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
