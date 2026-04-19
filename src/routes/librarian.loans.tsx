import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookMarked, Check, AlertCircle, Inbox } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loanService } from "@/services/loanService";
import { requestService } from "@/services/requestService";
import { bookService } from "@/services/bookService";
import { userService } from "@/services/userService";
import type { BookRequest, Loan } from "@/lib/types";

export const Route = createFileRoute("/librarian/loans")({
  head: () => ({
    meta: [
      { title: "Loans — Athenaeum" },
      { name: "description", content: "Hand out approved books and track active loans and overdue items." },
    ],
  }),
  component: () => (
    <RoleGate role="librarian">
      <Loans />
    </RoleGate>
  ),
});

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function Loans() {
  const [loans, setLoans] = useState<Loan[]>(() => loanService.list());
  const [approved, setApproved] = useState<BookRequest[]>(() =>
    requestService.byStatus("approved"),
  );
  const [tab, setTab] = useState("pickup");
  const [pickup, setPickup] = useState<BookRequest | null>(null);
  const [dueAt, setDueAt] = useState(defaultDueDate());
  const [classGrade, setClassGrade] = useState("");

  const refresh = () => {
    setLoans(loanService.list());
    setApproved(requestService.byStatus("approved"));
  };

  const submitPickup = () => {
    if (!pickup) return;
    const student = userService.get(pickup.studentId);
    const result = loanService.createFromRequest({
      requestId: pickup.id,
      bookId: pickup.bookId,
      studentId: pickup.studentId,
      dueAt: new Date(dueAt).toISOString(),
      classGrade: classGrade.trim() || student?.classGrade,
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Loan recorded");
    setPickup(null);
    refresh();
  };

  const active = loans
    .filter((l) => l.status === "active")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const returned = loans
    .filter((l) => l.status === "returned")
    .sort((a, b) => (b.returnedAt ?? "").localeCompare(a.returnedAt ?? ""));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-primary" /> Loans
        </h1>
        <p className="text-sm text-muted-foreground">
          Convert approved requests into loans at pickup; mark books returned.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pickup">Awaiting pickup ({approved.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({returned.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pickup" className="mt-4 space-y-3">
          {approved.length === 0 ? (
            <Empty />
          ) : (
            approved.map((r) => {
              const book = bookService.get(r.bookId);
              const student = userService.get(r.studentId);
              return (
                <Card key={r.id}>
                  <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{book?.title}</div>
                      <div className="text-xs text-muted-foreground">{book?.author}</div>
                      <div className="text-sm mt-1">
                        For <span className="font-medium">{student?.name}</span>
                        {student?.classGrade ? ` · ${student.classGrade}` : ""}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setPickup(r);
                        setDueAt(defaultDueDate());
                        setClassGrade(student?.classGrade ?? "");
                      }}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Mark picked up
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0 ? (
            <Empty />
          ) : (
            active.map((l) => {
              const book = bookService.get(l.bookId);
              const student = userService.get(l.studentId);
              const overdue = loanService.isOverdue(l);
              return (
                <Card key={l.id}>
                  <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{book?.title}</div>
                      <div className="text-xs text-muted-foreground">{book?.author}</div>
                      <div className="text-sm mt-1">
                        {student?.name}
                        {l.classGrade ? ` · ${l.classGrade}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={overdue ? "destructive" : "secondary"}>
                        {overdue && <AlertCircle className="h-3 w-3 mr-1" />}
                        Due {new Date(l.dueAt).toLocaleDateString()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          loanService.markReturned(l.id);
                          toast.success("Marked as returned");
                          refresh();
                        }}
                      >
                        Mark returned
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="returned" className="mt-4 space-y-3">
          {returned.length === 0 ? (
            <Empty />
          ) : (
            returned.map((l) => {
              const book = bookService.get(l.bookId);
              const student = userService.get(l.studentId);
              return (
                <Card key={l.id}>
                  <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{book?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {student?.name} · returned {l.returnedAt ? new Date(l.returnedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!pickup} onOpenChange={(o) => !o && setPickup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record pickup</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="due">Due date</Label>
              <Input id="due" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="class">Class / grade</Label>
              <Input
                id="class"
                placeholder="e.g. 10A"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPickup(null)}>
              Cancel
            </Button>
            <Button onClick={submitPickup}>Confirm pickup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Empty() {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
        Nothing here.
      </CardContent>
    </Card>
  );
}
