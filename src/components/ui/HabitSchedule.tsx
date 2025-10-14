"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Timer } from "lucide-react";
import SubjectCard from "@/components/ui/SubjectCard";
import CreateSubjectDialog from "@/components/ui/CreateSubjectDialog";
import { toast } from "@/hooks/use-toast";

export interface Subject {
  id: string;
  title: string;
  description: string;
  scheduledDate?: Date;
  createdAt: Date;
}

const Page = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);

  const createSubject = (
    title: string,
    description: string,
    scheduledDate?: Date
  ) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      title,
      description,
      scheduledDate,
      createdAt: new Date(),
    };
    setSubjects((prev) => [...prev, newSubject]);
    toast({
      title: "Subject created",
      description: scheduledDate
        ? `${title} scheduled for ${scheduledDate.toLocaleDateString()}`
        : `${title} has been added to your study tracker.`,
    });
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (selectedSubject?.id === id) setSelectedSubject(null);
    toast({
      title: "Subject deleted",
      description: "The subject has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-sky-500">
              Study Tracker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Organize your studies with Study Tracker
          </p>
        </header>

        {/* Main Content (Subjects only) */}
        {!selectedSubject ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Subjects</h2>
              <Button
                onClick={() => setShowSubjectDialog(true)}
                className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Subject
              </Button>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-12 border border-border shadow-medium">
                  <Timer className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No subjects yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first subject to start tracking your study
                    sessions
                  </p>
                  <Button
                    onClick={() => setShowSubjectDialog(true)}
                    size="lg"
                    className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Subject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={setSelectedSubject}
                    onDelete={deleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedSubject(null)}
                className="gap-2 text-sky-600 hover:bg-sky-50"
              >
                <ArrowLeft className="h-4 w-4 text-sky-600" />
                Back to Subjects
              </Button>
              {/* Tidak ada tombol Task di mode Subject-only */}
              <div />
            </div>

            {/* Detail Subject (tanpa Task list) */}
            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border shadow-medium">
              <h2 className="text-3xl font-bold mb-2">
                {selectedSubject.title}
              </h2>
              <p className="text-muted-foreground">
                {selectedSubject.description}
              </p>
              {selectedSubject.scheduledDate && (
                <p className="text-sm text-muted-foreground mt-3">
                  Scheduled:{" "}
                  {selectedSubject.scheduledDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dialog: Subject saja */}
        <CreateSubjectDialog
          open={showSubjectDialog}
          onOpenChange={setShowSubjectDialog}
          onSubmit={createSubject}
        />
      </div>
    </div>
  );
};

export default Page;
