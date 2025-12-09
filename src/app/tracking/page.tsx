"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import {
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakCalendar from "@/components/ui/streak-calender";
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

import { Task } from "@/types/schedule";

/* ---------------- SELECT COMPONENT IMPORT ---------------- */
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
};

// Helper untuk membandingkan tanggal tanpa jam
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [maxSubjectTaskCount, setMaxSubjectTaskCount] = useState(1);

  const [range, setRange] = useState("7"); // default: last 7 days

  // State Data
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  const [weeklyData, setWeeklyData] = useState<
    { name: string; minutes: number }[]
  >([]);
  const [subjectPerformance, setSubjectPerformance] = useState<
    { name: string; tasks: number }[]
  >([]);

  /* ----------------------------- FETCH -------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch Subjects
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

        // 2. Fetch Tasks
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

        /* --------------------------- CALCULATIONS --------------------------- */
        const completedTasks = tasks.filter((t) => t.completed);

        // A. Total Metrics
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

        /* ----------------------- WEEKLY DATA FILTER ------------------------ */

        const selectedRange = parseInt(range); // 7 / 14 / 30 / 999 (all time)

        const periodDays =
          selectedRange === 999
            ? 90 // default show 3 months if ALL TIME
            : selectedRange;

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

        /* -------------------- SUBJECT PERFORMANCE -------------------- */
        const subjectStats: Record<string, number> = {};
        completedTasks.forEach((t) => {
          const subjectName = subjectsMap.get(t.subjectId) || "Uncategorized";
          subjectStats[subjectName] = (subjectStats[subjectName] || 0) + 1;
        });

        // Ubah ke array dan sort dari terbanyak
        const subjectChartData = Object.entries(subjectStats)
          .map(([name, count]) => ({ name, tasks: count }))
          .sort((a, b) => b.tasks - a.tasks)
          .slice(0, 5);

        // Cari nilai maksimum untuk kalkulasi lebar bar (agar proporsional)
        const maxVal =
          subjectChartData.length > 0 ? subjectChartData[0].tasks : 1;

        setMaxSubjectTaskCount(maxVal);
        setSubjectPerformance(subjectChartData);
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, range]); // <-- filter akan trigger ulang fetch

  /* ------------------------------- UI -------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <header className="bg-white border-b px-4 py-4 md:px-6 md:py-8 mb-6 md:mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Kiri: Tombol Back & Judul */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Go back"
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

            {/* Kanan: Streak Button & Dialog */}
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

              <DialogContent className="max-w-[90vw] md:max-w-sm p-0 border-none bg-transparent shadow-none">
                <VisuallyHidden>
                  <DialogHeader>
                    <DialogTitle>Streak Popup</DialogTitle>
                    <DialogDescription>
                      Informasi streak harian kamu
                    </DialogDescription>
                  </DialogHeader>
                </VisuallyHidden>

                <div className="relative bg-gradient-to-b from-white to-orange-50 rounded-2xl p-8 md:p-10 text-center shadow-xl overflow-hidden">
                  {/* Glow Background */}
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute top-[-40px] right-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-400/20 blur-3xl rounded-full"></div>
                    <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 md:w-40 md:h-40 bg-orange-300/20 blur-3xl rounded-full"></div>
                  </div>

                  {/* Flame Icon */}
                  <div className="relative mb-3">
                    <div className="absolute inset-0 blur-xl bg-orange-500/40 rounded-full -z-10 scale-150"></div>
                    <span className="text-orange-500 text-4xl md:text-5xl drop-shadow-md">
                      🔥
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-gray-700 text-lg md:text-xl font-medium tracking-wide">
                    Kamu belajar
                  </p>

                  {/* Streak Number */}
                  <h2 className="text-8xl md:text-[110px] font-black text-orange-500 leading-none drop-shadow-sm my-2 md:my-0">
                    0
                  </h2>

                  {/* Subtitle */}
                  <p className="text-gray-600 text-lg md:text-xl font-medium mb-6 md:mb-8">
                    hari berturut-turut!
                  </p>

                  {/* Watermark */}
                  <div className="mt-2 md:mt-4 text-sky-500 font-semibold text-xs md:text-sm opacity-80 tracking-wide">
                    © Studify
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Focus */}
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

          {/* Completed Tasks */}
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

          {/* Completion Rate */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Chart */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="flex flex-col gap-2 w-full">
              <div className="flex w-full justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-sky-500" />
                  Focus Activity
                </CardTitle>

                {/* ---------------- FILTER DROPDOWN ---------------- */}
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="w-[200px] cursor-pointer">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7" className="cursor-pointer">
                      Last 7 days
                    </SelectItem>
                    <SelectItem value="14" className="cursor-pointer">
                      Last 14 days
                    </SelectItem>
                    <SelectItem value="30" className="cursor-pointer">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="999" className="cursor-pointer">
                      All Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-[300px] w-full">
                {weeklyData.every((d) => d.minutes === 0) ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No activity recorded.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
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

          {/* Right: Subject Breakdown */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                Top Subjects by Completed Tasks
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {subjectPerformance.length === 0 ? (
                  <div className="h-[250px] flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <CheckCircle2 className="w-8 h-8 opacity-20" />
                    <p>No completed tasks yet.</p>
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

                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{
                            // PERBAIKAN: Gunakan maxSubjectTaskCount sebagai pembagi
                            width: `${
                              (subject.tasks / maxSubjectTaskCount) * 100
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

        <Card className="shadow-sm border-gray-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-500" /> Streak Calendar
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCalendar />
          </CardContent>
        </Card>
        {/* End of Kalender Runtutan */}
      </main>
    </div>
  );
};

export default Page;
