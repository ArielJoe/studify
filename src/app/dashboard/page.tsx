"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Timer, TrendingUp, Loader2, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Pastikan import dari UI Component yang benar
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogHeader } from "@/components/ui/dialog";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  const features = [
    {
      icon: Timer,
      title: "Pomodoro Timer",
      description: "Maximize focus with customizable work and break intervals.",
      href: "/pomodoro",
    },
    {
      icon: Calendar,
      title: "Habit Scheduling",
      description: "Organize your daily routines to build consistent habits.",
      href: "/schedule",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visualize your growth with insights and achievement streaks.",
      href: "/tracking",
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Kiri */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              Studify
            </h1>
          </div>

          {/* Profil Kanan (Nama & Gambar) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* --- STREAK POPUP --- */}
            <Dialog open={showStreakPopup} onOpenChange={setShowStreakPopup}>
              <DialogTrigger asChild>
                <div
                  className="flex items-center gap-1.5 md:gap-2 bg-orange-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full cursor-pointer hover:bg-orange-200 transition shadow-sm"
                  onClick={() => setShowStreakPopup(true)}
                >
                  <span className="text-orange-600 font-semibold text-xs md:text-base flex items-center gap-1">
                    🔥 0 day
                  </span>
                </div>
              </DialogTrigger>

              {/* Tambahkan class positioning di sini:
                  - fixed: Agar melayang di atas konten lain
                  - top-1/2 left-1/2: Titik awal di tengah layar
                  - -translate-x-1/2 -translate-y-1/2: Menggeser elemen agar benar-benar di tengah (center anchor)
              */}
              <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90vw] md:max-w-[500px] p-0 border-none bg-transparent shadow-none outline-none">
                <VisuallyHidden>
                  <DialogHeader>
                    <DialogTitle>Streak Popup</DialogTitle>
                    <DialogDescription>
                      Informasi streak harian kamu
                    </DialogDescription>
                  </DialogHeader>
                </VisuallyHidden>

                <div className="relative bg-gradient-to-b from-white to-orange-50 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden flex items-center justify-between gap-4">
                  {/* Glow Background */}
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-[-40px] right-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-400/20 blur-3xl rounded-full"></div>
                    <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-300/20 blur-3xl rounded-full"></div>
                  </div>

                  {/* LEFT SIDE: TEXT */}
                  <div className="text-left flex flex-col z-10">
                    <p className="text-gray-700 text-lg md:text-2xl font-bold tracking-wide">
                      Kamu belajar
                    </p>
                    <h2 className="text-7xl md:text-[80px] font-black text-orange-500 leading-none drop-shadow-sm my-1 md:my-3">
                      0
                    </h2>
                    <p className="text-gray-700 text-lg md:text-2xl font-bold">
                      hari berturut-turut!
                    </p>
                  </div>

                  {/* RIGHT SIDE: FLAME ICON */}
                  <div className="relative shrink-0 z-10 mr-2 md:mr-6">
                    <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full -z-10 scale-150"></div>
                    <span className="text-orange-500 text-[80px] md:text-[140px] drop-shadow-md leading-none">
                      🔥
                    </span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const FeatureContent = (
                <div className="h-full p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-sky-200 bg-white group">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #5eead4 0%, #3b82f6 100%)",
                    }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-sky-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );

              return feature.href ? (
                <Link href={feature.href} key={index} className="block h-full">
                  {FeatureContent}
                </Link>
              ) : (
                <div key={index} className="h-full">
                  {FeatureContent}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
