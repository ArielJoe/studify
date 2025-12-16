import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Subject, Task } from "@/types/schedule";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Clock, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  subjects: Subject[];
  tasks: Task[];
  onDateSelect?: (date: Date | undefined) => void;
  onSelectSubject?: (subject: Subject) => void;
  selectedDate?: Date;
}

const ScheduleCalendar = ({
  subjects,
  tasks,
  onDateSelect,
  onSelectSubject,
  selectedDate,
}: ScheduleCalendarProps) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set()
  );

  // Get scheduled dates
  const scheduledDates = subjects
    .filter((s) => s.scheduledDate)
    .map((s) => s.scheduledDate as Date);

  // Check dates
  const hasScheduledSubject = (date: Date) => {
    return scheduledDates.some(
      (scheduledDate) => scheduledDate.toDateString() === date.toDateString()
    );
  };

  // Get date subjects
  const getSubjectsForDate = (date: Date) => {
    return subjects.filter(
      (s) =>
        s.scheduledDate &&
        s.scheduledDate.toDateString() === date.toDateString()
    );
  };

  // Get subject tasks
  const getTasksForSubject = (subjectId: string) => {
    console.log("Getting tasks for subjectId:", tasks, subjectId);
    return tasks.filter((t) => t.subjectId === subjectId);
  };

  const toggleExpanded = (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleSubjectClick = (subject: Subject) => {
    onSelectSubject?.(subject);
  };

  return (
    <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-3 md:p-4 border border-border shadow-medium">
      <h3 className="text-lg font-semibold mb-3">Study Schedule</h3>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md pointer-events-auto"
        modifiers={{
          scheduled: (date) => hasScheduledSubject(date),
        }}
        modifiersClassNames={{
          scheduled:
            "bg-primary/20 text-primary font-semibold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
        }}
      />

      {selectedDate && getSubjectsForDate(selectedDate).length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Scheduled for {selectedDate.toLocaleDateString()}:
          </h4>
          <div className="space-y-2">
            {getSubjectsForDate(selectedDate).map((subject) => {
              console.log("subject:", subject);
              const subjectTasks = getTasksForSubject(subject.id);
              const isExpanded = expandedSubjects.has(subject.id);
              {
                console.log("tasks:", subjectTasks);
              }
              return (
                <Collapsible key={subject.id} open={isExpanded}>
                  <div className="bg-card dark:bg-card/50 rounded-lg border border-border/50 overflow-hidden shadow-sm hover:border-sky-400/30 transition-all duration-200">
                    <div
                      className="flex items-center group p-1 hover:bg-sky-50 dark:hover:bg-sky-500/5 transition-colors cursor-pointer"
                      onClick={() => handleSubjectClick(subject)}
                    >
                      {subjectTasks.length > 0 && (
                        <CollapsibleTrigger asChild>
                          <button
                            onClick={(e) => toggleExpanded(subject.id, e)}
                            className="p-2 rounded-md hover:bg-sky-100 dark:hover:bg-sky-500/10 transition-colors cursor-pointer text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 mr-1"
                          >
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                      )}
                      <div
                        className={cn(
                          "flex-1 text-left py-1.5 text-sm font-medium",
                          !subjectTasks.length && "pl-2"
                        )}
                      >
                        <span className="text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{subject.title}</span>
                        {subjectTasks.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({subjectTasks.length} task
                            {subjectTasks.length !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>

                    <CollapsibleContent>
                      {subjectTasks.length > 0 && (
                        <div className="px-3 pb-2 pt-1 space-y-1.5 bg-muted/30 dark:bg-muted/10 border-t border-border/40">
                          {subjectTasks.map((task) => (
                            <div
                              key={task.id}
                              className={cn(
                                "text-xs px-3 py-2 rounded-md bg-background/80 hover:bg-background border border-transparent hover:border-border/50 shadow-sm flex items-center justify-between transition-all",
                                task.completed && "opacity-50 line-through bg-muted/50"
                              )}
                            >
                              <span className="truncate font-medium text-foreground/80">{task.title}</span>
                              <div className="flex items-center gap-3 text-muted-foreground ml-2 shrink-0">
                                <span className="flex items-center gap-1 bg-sky-500/5 px-1.5 py-0.5 rounded text-[10px]">
                                  <Clock className="h-3 w-3 text-sky-500" />
                                  {task.pomodoroMinutes}m
                                </span>
                                {task.breakMinutes > 0 && (
                                  <span className="flex items-center gap-1 bg-orange-500/5 px-1.5 py-0.5 rounded text-[10px]">
                                    <Coffee className="h-3 w-3 text-orange-500" />
                                    {task.breakMinutes}m
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
