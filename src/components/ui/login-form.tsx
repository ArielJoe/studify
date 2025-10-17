"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/ui/google-icon";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
            focusDuration: 25, // menit
            breakDuration: 5, // menit
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
      // alert("Login gagal. Coba lagi.");
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
      <Card className="shadow-elegant border-0 bg-card/90 backdrop-blur-sm">
        <CardContent className="space-y-6 p-8">
          {!user ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-lg">
                  Sign in to continue building your habits
                </p>
              </div>

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

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    By signing in, you agree to our{" "}
                    <a
                      href="#"
                      className="font-medium hover:underline text-sky-400"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="font-medium hover:underline text-sky-400"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              {/* Avatar */}
              <div className="flex justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.displayName?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "?"}
                  </div>
                )}
              </div>

              {/* Info pengguna */}
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {user.displayName || "User"}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              {/* Tombol logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
