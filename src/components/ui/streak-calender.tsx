import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  // Dummy data structure for now - logic will be added later
  studiedDates?: Date[];
  frozenDates?: Date[];
}

const StreakCalendar = ({ studiedDates = [], frozenDates = [] }: StreakCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

 const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week (0-6, where 0 is Sunday)
    let startDay = firstDay.getDay();
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    return { daysInMonth, startDay };
  };

  const { daysInMonth, startDay } = getDaysInMonth(currentDate);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Mock data for demonstration
  // Studied days (orange text): 1-5, 7, 8
  // Today (orange circle): 9
  // Frozen day (blue circle): 6
  const mockStudiedDays = [1, 2, 3, 4, 5, 7, 8, 9];
  const mockFrozenDays = [6];
  const today = 9;

  // Group days into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="w-full">

    
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-lg font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const isStudied = day && mockStudiedDays.includes(day);
                const isFrozen = day && mockFrozenDays.includes(day);
                const isToday = day === today;

                return (
                  <div
                    key={dayIndex}
                    className="relative flex items-center justify-center py-2"
                  >
                    {day && (
                      <div
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-full text-lg font-medium transition-all",
                          // Default state
                          !isStudied && !isFrozen && !isToday && "text-muted-foreground",
                          // Studied days (not today) - orange text only
                          isStudied && !isToday && "text-orange-500 font-semibold",
                          // Today with study - orange circle
                          isToday && isStudied && "bg-orange-500 text-foreground font-bold shadow-lg",
                          // Frozen/skipped days - blue circle
                          isFrozen && "bg-sky-400 text-foreground font-bold shadow-lg"
                        )}
                      >
                        {day}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
  
  );
};

export default StreakCalendar;
