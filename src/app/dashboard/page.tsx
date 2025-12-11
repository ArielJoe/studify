"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Timer, TrendingUp, Loader2, LogOut, Menu } from "lucide-react";
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
import { StreakCard } from "@/components/ui/StreakCard";
import { ModeToggle } from "@/components/mode-toggle";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      href: "/progress",
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
    <div className="min-h-screen bg-muted/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Kiri */}
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 md:w-14 md:h-14">
              <Image
                src="/logo.png"
                alt="Studify Logo"
                fill
                className="object-contain scale-125"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              Studify
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border shadow-sm hover:shadow-md transition-all"
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

            <StreakCard />
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-4 space-y-4 shadow-xl border-border bg-card">
                <div className="flex flex-col items-center gap-2 border-b border-border pb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-border">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl">
                        {user.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg">
                    <ModeToggle />
                  </div>
                  <StreakCard />
                </div>

                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const FeatureContent = (
                <div className="h-full p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-sky-200 bg-card group">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #5eead4 0%, #3b82f6 100%)",
                    }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-sky-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
