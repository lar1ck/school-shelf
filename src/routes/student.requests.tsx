import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Inbox } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requestService } from "@/services/requestService";
import { bookService } from "@/services/bookService";
import type { BookRequest, RequestStatus } from "@/lib/types";

export const Route = createFileRoute("/student/requests")({
  head: () => ({
    meta: [
      { title: "My Requests — Athenaeum" },
      { name: "description", content: "Track the status of your book requests." },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <MyRequests />
    </RoleGate>
  ),
});

const STATUS_VARIANT: Record<RequestStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  fulfilled: "outline",
  rejected: "destructive",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved — go pick it up",
  fulfilled: "Picked up",
  rejected: "Rejected",
};

function MyRequests() {
  const { user } = useAuth();
  const [items] = useState<BookRequest[]>(() =>
    requestService.byStudent(user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> My requests
        </h1>
        <p className="text-sm text-muted-foreground">
          See what's pending, approved, or fulfilled.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
            You haven't requested any books yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const book = bookService.get(r.bookId);
            return (
              <Card key={r.id}>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{book?.title ?? "Unknown book"}</div>
                    <div className="text-xs text-muted-foreground">{book?.author}</div>
                    {r.note && (
                      <div className="mt-2 text-xs bg-secondary/60 text-secondary-foreground rounded px-2 py-1">
                        Librarian note: {r.note}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Requested {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
