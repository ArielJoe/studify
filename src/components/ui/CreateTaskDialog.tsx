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

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, pomodoroMinutes: number, breakMinutes: number) => void;
}

const CreateTaskDialog = ({ open, onOpenChange, onSubmit }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const handleSubmit = () => {
    if (title.trim() && pomodoroMinutes > 0) {
      onSubmit(title, pomodoroMinutes, breakMinutes);
      setTitle("");
      setPomodoroMinutes(25);
      setBreakMinutes(5);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sky-600">Create New Task</DialogTitle>
          <DialogDescription>
            Add a task with Pomodoro timer and break duration.
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
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
