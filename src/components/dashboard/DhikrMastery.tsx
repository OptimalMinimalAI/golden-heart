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

export default function DhikrMastery({ className }: ComponentProps<'div'>) {
  const [dhikrs, setDhikrs] = useState<string[]>([]);
  const [newDhikr, setNewDhikr] = useState("");
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedDhikrs = localStorage.getItem('masteryDhikrs');
    if (savedDhikrs) {
        try {
            setDhikrs(JSON.parse(savedDhikrs));
        } catch(e) {
            setDhikrs([]);
        }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('masteryDhikrs', JSON.stringify(dhikrs));
    }
  }, [dhikrs, isClient]);

  const handleAddDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDhikr.trim()) {
      setDhikrs([newDhikr.trim(), ...dhikrs]);
      setNewDhikr("");
      toast({
        title: "Dhikr Added",
        description: "Your new Dhikr for study has been saved.",
      });
    }
  };
  
  const handleDeleteDhikr = (index: number) => {
    setDhikrs(dhikrs.filter((_, i) => i !== index));
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
            {dhikrs.map((dhikr, index) => (
                <li key={index} className="flex items-center justify-between bg-secondary/50 p-3 rounded-md animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <span className="text-secondary-foreground">{dhikr}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDhikr(index)} aria-label={`Delete ${dhikr}`}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
                </li>
            ))}
            {dhikrs.length === 0 && <p className="text-sm text-muted-foreground text-center pt-8">No Dhikrs added yet.</p>}
            </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
