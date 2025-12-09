"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/ui/google-icon";
import { Loader2, LogOut } from "lucide-react";

const LoginForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          pomodoroConfig: {
            focusDuration: 25,
            breakDuration: 5,
          },
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
          },
        });
      } else {
        await setDoc(
          userRef,
          { lastActive: serverTimestamp() },
          { merge: true }
        );
      }

      router.push("/dashboard");
    } catch (error) {
      console.log("Google login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border border-gray-100 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="">
          {!user ? (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
                  👋
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-[240px] mx-auto leading-relaxed">
                  Sign in to access your dashboard and continue your progress.
                </p>
              </div>

              {/* Action Section */}
              <div className="w-full">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="cursor-pointer w-full h-10 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md rounded-lg group text-sm"
                >
                  <GoogleIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* User Logged In View */}
              <div className="relative mb-4 group">
                {/* Blur effect dikurangi opacity-nya */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all opacity-30"></div>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={80}
                    height={80}
                    className="relative rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-2xl">
                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="text-center space-y-1 mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {user.displayName || "Explorer"}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {user.email}
                </p>
              </div>

              <div className="flex flex-col w-full gap-2">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer w-full h-10 rounded-lg font-semibold shadow-sm hover:shadow transition-all text-sm"
                >
                  Go to Dashboard
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="cursor-pointer w-full h-10 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
