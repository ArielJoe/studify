import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, MoreVertical, Clock, CheckCircle2, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/schedule";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface TaskListProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  /** Allow only this task (after pomodoro) */
  completableTaskId?: string | null;
}

const TaskList = ({
  tasks,
  onStartTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  completableTaskId = null,
}: TaskListProps) => {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <Card className="p-8 bg-gradient-card backdrop-blur-sm border border-sky-100">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-60 text-sky-400" />
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        </Card>
      ) : (
        tasks.map((task) => {
          const isAllowedToComplete = completableTaskId === task.id;
          const isBlocked = !isAllowedToComplete;

          return (
            <Card
              key={task.id}
              className="bg-gradient-card backdrop-blur-sm border border-sky-100 shadow-soft hover:shadow-medium transition-all"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between p-3 rounded-lg border border-sky-100 hover:bg-sky-50/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Block click without disabled */}
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => {
                        if (!isBlocked) onToggleTask(task.id);
                      }}
                      onClick={(e) => {
                        if (isBlocked) e.preventDefault(); // Prevent click
                      }}
                      onKeyDown={(e) => {
                        if (isBlocked && (e.key === " " || e.key === "Enter")) {
                          e.preventDefault(); // Prevent keyboard toggle
                        }
                      }}
                      tabIndex={isBlocked ? -1 : 0} // Disable focus when blocked
                      aria-disabled={isBlocked}
                      className={`${isBlocked ? "opacity-50 cursor-default" : "hover:border-sky-400"}`}
                    />

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {task.completed && (
                        <CheckCircle2 className="h-5 w-5 text-sky-500 shrink-0" />
                      )}
                      <span
                        className={
                          task.completed
                            ? "line-through text-muted-foreground truncate"
                            : "font-medium truncate"
                        }
                        title={task.title}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="font-mono border border-sky-200 bg-sky-50 text-sky-700"
                      >
                        {task.pomodoroMinutes}m
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono border-sky-300 bg-sky-50 text-sky-600"
                      >
                        Break: {task.breakMinutes}m
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    {!task.completed && (
                      <Button
                        size="sm"
                        onClick={() => onStartTask(task)}
                        className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}

                    {/* Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-sky-100">
                          <MoreVertical className="h-5 w-5 text-sky-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditTask(task.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2 text-sky-600" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTask(task.id)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2 text-red-600" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TaskList;
