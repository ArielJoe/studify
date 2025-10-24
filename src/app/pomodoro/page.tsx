"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { PomodoroTimer } from "@/components/ui/PomodoroTimer";

export default function PomodoroPage() {
  const [pomodoroConfig, setPomodoroConfig] = useState<{
    focusDuration: number;
    breakDuration: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // ✅ Redirect ke login jika belum login
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const config = data.pomodoroConfig || {
            focusDuration: 25,
            breakDuration: 5,
          };
          setPomodoroConfig(config);
        } else {
          setPomodoroConfig({ focusDuration: 25, breakDuration: 5 });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        setPomodoroConfig({ focusDuration: 25, breakDuration: 5 });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const saveConfig = async (focus: number, breakDur: number) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      pomodoroConfig: { focusDuration: focus, breakDuration: breakDur },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // ✅ Jangan render timer jika pomodoroConfig null (seharusnya tidak terjadi karena redirect)
  if (!pomodoroConfig) {
    return null;
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      <PomodoroTimer
        initialFocus={pomodoroConfig.focusDuration}
        initialBreak={pomodoroConfig.breakDuration}
        onSaveSettings={saveConfig}
      />
    </div>
  );
}
