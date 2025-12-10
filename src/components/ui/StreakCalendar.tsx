"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreakCalendarProps {
  activeDates?: Date[];
}

const StreakCalendar = ({ activeDates = [] }: StreakCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    // Use full width
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-base sm:text-lg font-bold text-gray-800">
          {format(currentDate, "MMMM yyyy")}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDays.map((day) => (
          // Responsive font size
          <div
            key={day}
            className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      {/* Responsive gap */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-grow">
        {calendarDays.map((date, idx) => {
          const isActive = activeDates.some((activeDate) =>
            isSameDay(activeDate, date)
          );

          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isTodayDate = isToday(date);

          return (
            <div
              key={idx}
              // Maintain aspect ratio
              // Rounded corners
              className={`
                aspect-square flex items-center justify-center 
                rounded-md sm:rounded-lg text-sm sm:text-base font-medium transition-all duration-200 cursor-default
                ${!isCurrentMonth ? "text-gray-300 opacity-40" : "text-gray-700"
                }
                ${isActive
                  ? "bg-orange-500 text-white shadow-sm border border-orange-600"
                  : isTodayDate
                    ? "border-2 border-sky-500 text-sky-600 font-bold"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {format(date, "d")}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-3 text-[10px] sm:text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border-2 border-sky-500"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-orange-500 border border-orange-600"></div>
          <span>Studied</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
