import { ALLAH_NAMES } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from 'react';

export default function AllahNames({ className }: ComponentProps<'div'>) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BookOpen /> The 99 Names of Allah
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {ALLAH_NAMES.map((name) => (
              <AccordionItem value={`item-${name.id}`} key={name.id}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-left">{name.id}. {name.name}</span>
                    <span className="font-headline text-2xl text-right text-primary" dir="rtl">{name.transliteration}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-2">
                  {name.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
