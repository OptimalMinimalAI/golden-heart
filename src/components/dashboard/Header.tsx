
"use client";

import { LogIn, LogOut, Moon, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import { signOut, sendSignInLinkToEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const GoldenHeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
)

export default function Header() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);

  const handleLogout = () => {
    signOut(auth);
    toast({
      title: "Signed Out",
      description: "You have been signed out.",
    });
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSendingLink(true);
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        title: "Check your email",
        description: `A sign-in link has been sent to ${email}.`,
      });
      setIsLoginDialogOpen(false);
    } catch (error: any) {
      console.error("Error sending sign-in link:", error);
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: error.message || "Could not send sign-in link.",
      });
    } finally {
      setIsSendingLink(false);
    }
  }

  return (
    <>
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
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Moon className="h-5 w-5" />
                  <span className="sr-only">Toggle Theme</span>
              </Button>
              
              {isUserLoading ? (
                <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <Button variant="secondary" disabled>
                      <User className="mr-2 h-4 w-4" />
                      {user.email}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </Button>
                </>
              )}
          </div>
      </header>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in via Email</DialogTitle>
            <DialogDescription>
              Enter your email below to receive a secure, passwordless sign-in link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailLogin}>
            <div className="my-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email-login">Email</Label>
                <Input 
                  type="email" 
                  id="email-login" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSendingLink}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSendingLink} className="w-full">
                <Mail className="mr-2" />
                {isSendingLink ? "Sending Link..." : "Send Sign-in Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
