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
      console.error("Google login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md flex justify-center items-center h-32">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg border border-border bg-card/80 backdrop-blur-sm rounded-2xl">
        <CardContent className="space-y-8 p-8">
          {!user ? (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-lg">
                  Sign in to continue building your habits
                </p>
              </div>

              {/* Login Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  size="lg"
                  className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  By signing in, you agree to our{" "}
                  <a
                    href="#"
                    className="font-medium hover:underline text-sky-500"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-medium hover:underline text-sky-500"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* User Info */}
              <div className="text-center space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={80}
                      height={80}
                      className="rounded-full border-2 border-primary/40 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {user.displayName?.charAt(0).toUpperCase() ||
                        user.email?.charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user.displayName || "User"}
                  </h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>

                {/* Logout */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="mt-2 hover:bg-red-50 hover:text-red-600 transition"
                >
                  Logout
                </Button>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
                You are currently signed in with Google.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
