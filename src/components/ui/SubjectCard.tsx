import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar as CalendarIcon, MoreVertical, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Subject } from "@/types/schedule";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;   // <-- untuk buka dialog update
  onDelete: (id: string) => void;
}

const SubjectCard = ({ subject, onSelect, onEdit, onDelete }: SubjectCardProps) => {
  return (
    <Card
      className="group transition-all duration-300 cursor-pointer
             bg-gradient-card backdrop-blur-sm
             border border-sky-100 dark:border-border
             hover:-translate-y-1 hover:shadow-medium"
      onClick={() => onSelect(subject)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {/* kiri: ikon + teks */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-sky-400">
              <BookOpen className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-xl group-hover:text-sky-500 transition-colors">
                  {subject.title}
                </CardTitle>

                {subject.scheduledDate && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-sky-300 bg-sky-50 text-sky-600 shrink-0"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {format(
                      subject.scheduledDate instanceof Date
                        ? subject.scheduledDate
                        : new Date(subject.scheduledDate),
                      "MMM d, yyyy"
                    )}
                  </Badge>
                )}
              </div>

              <CardDescription className="line-clamp-2">
                {subject.description}
              </CardDescription>
            </div>
          </div>

          {/* kanan: dropdown tiga titik */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-sky-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5 text-sky-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={() => onEdit(subject)}
                className="cursor-pointer"
              >
                <Pencil className="h-4 w-4 mr-2 text-sky-600" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(subject.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SubjectCard;
