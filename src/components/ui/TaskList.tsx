import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

interface TaskListProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
}

const TaskList = ({ tasks, onStartTask, onToggleTask }: TaskListProps) => {
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
        tasks.map((task) => (
          <Card
            key={task.id}
            className="bg-gradient-card backdrop-blur-sm border border-sky-100 shadow-soft hover:shadow-medium transition-all"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-3 rounded-lg border border-sky-100 hover:bg-sky-50/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  {/* pakai style checkbox sky-400 dari komponennya, tanpa override success */}
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="hover:border-sky-400"
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

                {!task.completed && (
                  <Button
                    size="sm"
                    onClick={() => onStartTask(task)}
                    className="bg-sky-400 hover:bg-sky-500 text-white transition-colors ml-3"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TaskList;
