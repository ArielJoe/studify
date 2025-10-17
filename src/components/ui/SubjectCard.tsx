import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Subject } from "@/types/schedule";

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const SubjectCard = ({ subject, onSelect, onDelete }: SubjectCardProps) => {
  return (
    <Card
      className="group hover:shadow-medium transition-all duration-300 cursor-pointer bg-gradient-card backdrop-blur-sm border border-sky-100"
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
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl group-hover:text-sky-500 transition-colors">
                  {subject.title}
                </CardTitle>

                {subject.scheduledDate && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-sky-300 bg-sky-50 text-sky-600"
                  >
                    <Calendar className="h-3 w-3" />
                    {format(subject.scheduledDate, "MMM d, yyyy")}
                  </Badge>
                )}
              </div>

              <CardDescription className="line-clamp-2">
                {subject.description}
              </CardDescription>
            </div>
          </div>

          {/* kanan: tombol hapus */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-500 hover:bg-sky-50 hover:text-sky-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SubjectCard;
