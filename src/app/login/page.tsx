import Image from "next/image";
import LoginForm from "@/components/ui/login-form";
import { Badge } from "@/components/ui/badge";


const Page = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <Image
          src="/hero-habits.jpg"
          alt="Habit tracking illustration"
          fill
          priority
          className="absolute inset-0 object-cover opacity-80"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md space-y-6">
            <Badge variant="secondary" className="w-fit mb-4">
              ✨ Transform Your Life
            </Badge>
            <h2 className="text-4xl font-bold leading-tight">
              Build better habits, one day at a time
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Track your progress, stay motivated, and transform your daily routines into lasting positive changes.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold">Visual Progress</h3>
                  <p className="text-white/80">See your growth over time</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold">Goal Setting</h3>
                  <p className="text-white/80">Set and achieve meaningful goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:flex-none lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
              HabitFlow
            </h1>
            <p className="text-muted-foreground mt-2">
              Your personal habit tracking companion
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
