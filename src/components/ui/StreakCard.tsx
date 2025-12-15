"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const StreakCard = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Listen real-time ke dokumen user untuk update streak otomatis
        const unsubDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const serverStreak = data.streak?.currentStreak || 0;
            const lastActiveDate = data.streak?.lastActiveDate;

            // Visual reset (DB updates on next task)
            let displayedStreak = serverStreak;

            if (lastActiveDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const last = new Date(lastActiveDate);
              last.setHours(0, 0, 0, 0);

              const diffTime = today.getTime() - last.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

              // Reset if > 1 day gap
              if (diffDays > 1) {
                displayedStreak = 0;
              }
            }

            setStreak(displayedStreak);
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setStreak(0);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="flex items-center gap-1.5 md:gap-2 bg-orange-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full cursor-pointer hover:bg-orange-200 transition shadow-sm"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-orange-600 font-semibold text-xs md:text-base flex items-center gap-1">
            🔥 {streak} day{streak !== 1 ? "s" : ""}
          </span>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[90vw] md:max-w-[500px] p-0 border-none bg-transparent shadow-none outline-none">
        
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Streak Popup</DialogTitle>
            <DialogDescription>Informasi streak harian kamu</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative bg-gradient-to-b from-background to-orange-50 dark:to-orange-950/20 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden flex items-center justify-between gap-4">
          {/* Glow Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-400/20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-300/20 blur-3xl rounded-full"></div>
          </div>

          {/* LEFT SIDE: TEXT */}
          <div className="text-left flex flex-col z-10">
            <p className="text-foreground text-lg md:text-2xl font-bold tracking-wide">
              Kamu belajar
            </p>
            <h2 className="text-5xl md:text-[80px] font-black text-orange-500 leading-none drop-shadow-sm my-1 md:my-3">
              {streak}
            </h2>
            <p className="text-foreground text-lg md:text-2xl font-bold">
              hari berturut-turut!
            </p>
          </div>

          {/* RIGHT SIDE: FLAME ICON */}
          <div className="relative shrink-0 z-10 mr-2 md:mr-6">
            <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full -z-10 scale-150"></div>
            <span className="text-orange-500 text-[60px] md:text-[140px] drop-shadow-md leading-none animate-pulse">
              🔥
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
