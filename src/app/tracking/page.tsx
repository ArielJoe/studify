"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
import { Task } from "@/types/schedule";

// Helper untuk format tanggal sumbu X
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

  // State Data
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  const [weeklyData, setWeeklyData] = useState<
    { name: string; minutes: number }[]
  >([]);
  const [subjectPerformance, setSubjectPerformance] = useState<
    { name: string; tasks: number }[]
  >([]);

  // State baru untuk menghitung proporsi bar subject
  const [maxSubjectTaskCount, setMaxSubjectTaskCount] = useState(1);

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

        // --- 3. LOGIKA STATISTIK ---
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

        // B. Weekly Data (Fix Logic)
        // Buat array 7 hari terakhir (dari H-6 sampai Hari Ini)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i)); // Mundur dari 6 hari lalu ke 0 (hari ini)
          return d;
        });

        const weeklyChartData = last7Days.map((date) => {
          // Cari task yang selesai pada tanggal 'date'
          const tasksOnThisDay = completedTasks.filter((t) => {
            if (!t.completedAt) return false;
            return isSameDay(t.completedAt, date);
          });

          // Jumlahkan menit
          const dayMinutes = tasksOnThisDay.reduce(
            (acc, t) => acc + t.pomodoroMinutes,
            0
          );

          return {
            name: formatDate(date),
            minutes: dayMinutes,
          };
        });
        setWeeklyData(weeklyChartData);

        // C. Subject Performance (Fix Logic Bar Width)
        const subjectStats: Record<string, number> = {};
        completedTasks.forEach((t) => {
          const subjectName = subjectsMap.get(t.subjectId) || "Uncategorized";
          subjectStats[subjectName] = (subjectStats[subjectName] || 0) + 1;
        });

        // Ubah ke array dan sort dari terbanyak
        const subjectChartData = Object.entries(subjectStats)
          .map(([name, count]) => ({ name, tasks: count }))
          .sort((a, b) => b.tasks - a.tasks)
          .slice(0, 5); // Ambil Top 5

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
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <header className="bg-white border-b px-6 py-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-sky-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Progress Tracking
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-sky-100 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
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

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Weekly Activity Chart */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-500" />
                Focus Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {weeklyData.every((d) => d.minutes === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <TrendingUp className="w-8 h-8 opacity-20" />
                    <p>No activity recorded yet.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f9fafb" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [
                          `${value} min`,
                          "Focus Time",
                        ]}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {weeklyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
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
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
      </main>
    </div>
  );
};

export default Page;
