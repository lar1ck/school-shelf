import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userService } from "@/services/userService";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/librarian/students")({
  head: () => ({
    meta: [
      { title: "Students — LBMS" },
      { name: "description", content: "Manage student accounts: add, edit, and remove students." },
    ],
  }),
  component: () => (
    <RoleGate role="librarian">
      <Students />
    </RoleGate>
  ),
});

function Students() {
  const [students, setStudents] = useState<User[]>(() => userService.byRole("student"));
  const [open, setOpen] = useState(false);
  const refresh = () => setStudents(userService.byRole("student"));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Students
          </h1>
          <p className="text-sm text-muted-foreground">{students.length} accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Add student
            </Button>
          </DialogTrigger>
          <AddStudentDialog
            onCreated={() => {
              refresh();
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.studentId ? `${s.studentId} · ` : ""}
                  {s.classGrade ?? "No class"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (window.confirm(`Remove ${s.name}?`)) {
                    userService.remove(s.id);
                    refresh();
                    toast.success("Student removed");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddStudentDialog({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [studentId, setStudentId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    userService.create({
      name: name.trim(),
      role: "student",
      classGrade: classGrade.trim() || undefined,
      studentId: studentId.trim() || `S-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    toast.success("Student added");
    onCreated();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a student</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="grade">Class / grade</Label>
            <Input id="grade" placeholder="10A" value={classGrade} onChange={(e) => setClassGrade(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sid">Student ID</Label>
            <Input id="sid" placeholder="S-1234" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add student</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
