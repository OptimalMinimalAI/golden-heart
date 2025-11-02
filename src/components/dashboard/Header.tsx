import { LogIn, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const GoldenHeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
)

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-background">
        <div className="flex items-center gap-3">
            <GoldenHeartIcon />
            <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold font-headline text-primary tracking-wide">
                    GOLDEN HEART HUB
                </h1>
                <p className="text-md text-muted-foreground font-headline">- In LOVE We Are Healed.</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="w-9 h-9">
                <Moon className="h-5 w-5" />
                <span className="sr-only">Toggle Theme</span>
            </Button>
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Log in
            </Button>
        </div>
    </header>
  );
}
