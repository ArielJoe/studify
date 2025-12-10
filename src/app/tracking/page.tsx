"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
  CalendarDays,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Task } from "@/types/schedule";
import { StreakCard } from "@/components/ui/StreakCard";
import StreakCalendar from "@/components/ui/StreakCalendar";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
};

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Component State
  const [maxSubjectTaskCount, setMaxSubjectTaskCount] = useState(1);
  const [range, setRange] = useState("7");
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  const [weeklyData, setWeeklyData] = useState<
    { name: string; minutes: number }[]
  >([]);
  const [subjectPerformance, setSubjectPerformance] = useState<
    { name: string; tasks: number }[]
  >([]);
  const [activeDates, setActiveDates] = useState<Date[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const subjectsRef = collection(db, "subjects");
        const subjectsQuery = query(
          subjectsRef,
          where("userId", "==", user.uid)
        );
        const subjectsSnap = await getDocs(subjectsQuery);

        const subjectsMap = new Map<string, string>();
        subjectsSnap.docs.forEach((doc) => {
          const data = doc.data();
          subjectsMap.set(doc.id, data.title);
        });

        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(tasksRef, where("userId", "==", user.uid));
        const tasksSnap = await getDocs(tasksQuery);

        const tasks: Task[] = tasksSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            completedAt:
              data.completedAt instanceof Timestamp
                ? data.completedAt.toDate()
                : null,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          } as Task;
        });

        const completedTasks = tasks.filter((t) => t.completed);
        const dates = completedTasks
          .filter((t) => t.completedAt)
          .map((t) => t.completedAt as Date);
        setActiveDates(dates);

        const totalMinutes = completedTasks.reduce(
          (acc, t) => acc + t.pomodoroMinutes,
          0
        );
        setTotalFocusMinutes(totalMinutes);
        setCompletedTasksCount(completedTasks.length);
        setCompletionRate(
          tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0
        );

        const selectedRange = parseInt(range);
        const periodDays = selectedRange === 999 ? 90 : selectedRange;
        const lastXdays = Array.from({ length: periodDays }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (periodDays - 1 - i));
          d.setHours(0, 0, 0, 0);
          return d;
        });

        const weeklyChartData = lastXdays.map((date) => {
          const dayMinutes = completedTasks
            .filter((t) => {
              if (!t.completedAt) return false;
              const tDate = new Date(t.completedAt);
              return (
                tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
              );
            })
            .reduce((acc, t) => acc + t.pomodoroMinutes, 0);
          return { name: formatDate(date), minutes: dayMinutes };
        });
        setWeeklyData(weeklyChartData);

        const subjectStats: Record<string, number> = {};
        completedTasks.forEach((t) => {
          const subjectName = subjectsMap.get(t.subjectId) || "Uncategorized";
          subjectStats[subjectName] = (subjectStats[subjectName] || 0) + 1;
        });
        const subjectChartData = Object.entries(subjectStats)
          .map(([name, count]) => ({ name, tasks: count }))
          .sort((a, b) => b.tasks - a.tasks)
          .slice(0, 5);
        const maxVal =
          subjectChartData.length > 0 ? subjectChartData[0].tasks : 1;
        setMaxSubjectTaskCount(maxVal);
        setSubjectPerformance(subjectChartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, range]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <header className="bg-white border-b px-4 py-4 mb-6 md:mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-12 md:h-14">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 cursor-pointer" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-sky-500" />
              <h1 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">
                Progress Tracking
              </h1>
            </div>
          </div>
          <StreakCard />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-sky-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">
                Total Focus Time
              </CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accumulated focus minutes
              </p>
            </CardContent>
          </Card>

          <Card className="border-sky-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">
                Tasks Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {completedTasksCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tasks finished successfully
              </p>
            </CardContent>
          </Card>

          <Card className="border-sky-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Of total created tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Streak Calendar */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-500" />
                Streak Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StreakCalendar activeDates={activeDates} />
            </CardContent>
          </Card>

          {/* Top Subjects */}
          <Card className="shadow-sm border-gray-100 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {/* Layers Icon */}
                <Layers className="w-5 h-5 text-sky-500" /> Top Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-6 h-full">
                {subjectPerformance.length === 0 ? (
                  /* Empty Top Subjects */
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Layers className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">
                      No completed tasks per subject
                    </p>
                  </div>
                ) : (
                  subjectPerformance.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {subject.name}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {subject.tasks}{" "}
                          {subject.tasks === 1 ? "task" : "tasks"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${(subject.tasks / maxSubjectTaskCount) * 100
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Focus Activity */}
        <Card className="shadow-sm border-gray-100 lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 w-full">
            <div className="flex w-full justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {/* BarChart Icon */}
                <BarChart3 className="w-5 h-5 text-sky-500" /> Focus Activity
              </CardTitle>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[140px] cursor-pointer text-sm">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="999">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {weeklyData.every((d) => d.minutes === 0) ? (
                /* Empty Activity */
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <BarChart3 className="w-16 h-16 opacity-10" />
                  <p className="text-sm font-medium">
                    No activity recorded for this period
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.minutes > 0 ? "#38bdf8" : "#e5e7eb"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Page;
