import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { requestService } from "@/services/requestService";
import { bookService } from "@/services/bookService";
import { userService } from "@/services/userService";
import type { BookRequest, RequestStatus } from "@/lib/types";

export const Route = createFileRoute("/librarian/requests")({
  head: () => ({
    meta: [
      { title: "Requests — LBMS" },
      { name: "description", content: "Approve or reject student book requests with optional notes." },
    ],
  }),
  component: () => (
    <RoleGate role="librarian">
      <Requests />
    </RoleGate>
  ),
});

function Requests() {
  const [items, setItems] = useState<BookRequest[]>(() => requestService.list());
  const [tab, setTab] = useState<RequestStatus>("pending");
  const [decideTarget, setDecideTarget] = useState<{ req: BookRequest; decision: "approved" | "rejected" } | null>(null);
  const [note, setNote] = useState("");

  const refresh = () => setItems(requestService.list());

  const filtered = items
    .filter((r) => r.status === tab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const counts: Record<RequestStatus, number> = {
    pending: items.filter((r) => r.status === "pending").length,
    approved: items.filter((r) => r.status === "approved").length,
    fulfilled: items.filter((r) => r.status === "fulfilled").length,
    rejected: items.filter((r) => r.status === "rejected").length,
  };

  const submitDecision = () => {
    if (!decideTarget) return;
    requestService.decide(decideTarget.req.id, decideTarget.decision, note);
    toast.success(decideTarget.decision === "approved" ? "Request approved" : "Request rejected");
    setDecideTarget(null);
    setNote("");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Triage student borrow requests. Approved requests appear in Loans for pickup.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as RequestStatus)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled ({counts.fulfilled})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
                Nothing here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const book = bookService.get(r.bookId);
                const student = userService.get(r.studentId);
                return (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{book?.title ?? "Unknown book"}</div>
                        <div className="text-xs text-muted-foreground">
                          {book?.author} · ISBN {book?.isbn}
                        </div>
                        <div className="text-sm mt-1">
                          Requested by{" "}
                          <span className="font-medium">{student?.name ?? "Unknown"}</span>
                          {student?.classGrade ? ` (${student.classGrade})` : ""}
                        </div>
                        {r.note && (
                          <div className="mt-2 text-xs bg-secondary/60 text-secondary-foreground rounded px-2 py-1">
                            Note: {r.note}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {book ? `${book.availableCopies}/${book.totalCopies}` : "—"} avail
                        </Badge>
                        {r.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDecideTarget({ req: r, decision: "rejected" });
                                setNote("");
                              }}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDecideTarget({ req: r, decision: "approved" });
                                setNote("");
                              }}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!decideTarget} onOpenChange={(o) => !o && setDecideTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decideTarget?.decision === "approved" ? "Approve request" : "Reject request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Optionally add a note for the student.
            </p>
            <Textarea
              placeholder="e.g. Pick up before Friday — only one copy left."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecideTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={decideTarget?.decision === "approved" ? "default" : "destructive"}
              onClick={submitDecision}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
