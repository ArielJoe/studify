import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from "@/types/schedule";
import { useEffect } from "react";
interface UpdateTaskDialogProps {
  task: Task
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Task) => void;
}

const UpdateTaskDialog = ({task, open, onOpenChange, onSubmit }: UpdateTaskDialogProps) => {
  const [title, setTitle] = useState(task.title);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(task.pomodoroMinutes);
  const [breakMinutes, setBreakMinutes] = useState(task.breakMinutes
  );

useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPomodoroMinutes(task.pomodoroMinutes);
      setBreakMinutes(task.breakMinutes);
    }
  }, [task]);

  const handleSubmit = () => {
    if (title.trim() && pomodoroMinutes > 0) {

        const updateTask: Task = {
        ...task,
        title: title,
        pomodoroMinutes: pomodoroMinutes,
        breakMinutes: breakMinutes,
      }
      onSubmit(updateTask);
      
      setTitle("")
      setPomodoroMinutes(25)
      setBreakMinutes(5)
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sky-600">Update New Task</DialogTitle>
          <DialogDescription>
            Update a task with Pomodoro timer and break duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g., Study Chapter 5, Complete Assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-visible:ring-sky-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pomodoro">Pomodoro Duration (minutes)</Label>
            <Input
              id="pomodoro"
              type="number"
              min="1"
              max="120"
              value={pomodoroMinutes}
              onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
              className="focus-visible:ring-sky-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="break">Break Duration (minutes)</Label>
            <Input
              id="break"
              type="number"
              min="0"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="focus-visible:ring-sky-300"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-sky-600 hover:bg-sky-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
          >
            Update Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTaskDialog;
