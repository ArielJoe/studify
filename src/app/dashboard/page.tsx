import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Timer,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";

const Page = () => {
  const features = [
    {
      icon: Timer,
      title: "Pomodoro Timer",
      description:
        "Stay focused with customizable work and break intervals to maximize productivity",
      href: "/pomodoro",
    },
    {
      icon: Calendar,
      title: "Habit Scheduling",
      description:
        "Plan your daily routines and build consistent habits that stick",
      href: "/schedule",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visualize your growth with detailed statistics and achievement streaks",
      href: "/tracking",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #5eead4 0%, #60a5fa 50%, #3b82f6 100%)", // toska → biru → biru keunguan
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build better habits,
            <br />
            one day at a time
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Track your progress, stay motivated, and transform your daily
            routines into lasting positive changes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-sky-500 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all text-lg px-10 py-6 rounded-full font-semibold"
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Powerful features designed to help you build and maintain positive
              habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const FeatureContent = (
                <div
                  className="p-8 rounded-xl hover:shadow-lg transition-all duration-300 border-2 hover:border-sky-400 bg-gray-50 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, #5eead4 0%, #3b82f6 100%)",
                    }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );

              return feature.href ? (
                <Link href={feature.href} key={index} className="block">
                  {FeatureContent}
                </Link>
              ) : (
                <div key={index}>{FeatureContent}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-white border-t">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r text-sky-400 bg-clip-text">
            Studify
          </h3>
          <p className="text-gray-500 mb-6">
            Your companion for building lasting positive habits
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-sky-600 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-sky-600 transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-sky-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-sky-600 transition-colors">
              Contact
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            © 2024 Studify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
