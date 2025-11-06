import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Subject } from "@/types/schedule";

interface UpdateSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSubmit: (payload: {
    id: string;
    title: string;
    description: string;
    scheduledDate?: Date;
  }) => void;
}

const UpdateSubjectDialog = ({
  open,
  onOpenChange,
  subject,
  onSubmit,
}: UpdateSubjectDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (subject) {
      setTitle(subject.title ?? "");
      setDescription(subject.description ?? "");
      const d = subject.scheduledDate as unknown;
      const parsed =
        d instanceof Date
          ? d
          : typeof d === "string"
          ? new Date(d)
          : undefined;
      setScheduledDate(parsed);
    } else {
      setTitle("");
      setDescription("");
      setScheduledDate(undefined);
    }
  }, [subject, open]);

  const handleSubmit = () => {
    if (!subject) return;
    if (title.trim()) {
      onSubmit({
        id: subject.id,
        title: title.trim(),
        description: description.trim(),
        scheduledDate,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sky-600">Update Subject</DialogTitle>
          <DialogDescription>Edit your subject details and schedule.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Subject Title</Label>
            <Input
              id="title"
              placeholder="e.g., Mathematics, Physics, History"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-visible:ring-sky-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what you'll study..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="focus-visible:ring-sky-300"
            />
          </div>

          <div className="space-y-2">
            <Label>Schedule Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal focus-visible:ring-sky-300",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-sky-400" />
                  {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
            Update Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSubjectDialog;
