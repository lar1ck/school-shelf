import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookMarked, AlertCircle, Inbox } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { loanService } from "@/services/loanService";
import { bookService } from "@/services/bookService";
import type { Loan } from "@/lib/types";

export const Route = createFileRoute("/student/loans")({
  head: () => ({
    meta: [
      { title: "My Loans — Athenaeum" },
      { name: "description", content: "Your current and past borrowed books with due dates." },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <MyLoans />
    </RoleGate>
  ),
});

function MyLoans() {
  const { user } = useAuth();
  const [loans] = useState<Loan[]>(() => loanService.byStudent(user!.id));
  const active = loans
    .filter((l) => l.status === "active")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const past = loans
    .filter((l) => l.status === "returned")
    .sort((a, b) => (b.returnedAt ?? "").localeCompare(a.returnedAt ?? ""));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-primary" /> My loans
        </h1>
        <p className="text-sm text-muted-foreground">
          Books you currently have, and your borrow history.
        </p>
      </div>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="history">History ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0 ? (
            <Empty text="No active loans." />
          ) : (
            active.map((l) => {
              const book = bookService.get(l.bookId);
              const overdue = loanService.isOverdue(l);
              return (
                <Card key={l.id}>
                  <CardContent className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{book?.title}</div>
                      <div className="text-xs text-muted-foreground">{book?.author}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Borrowed {new Date(l.borrowedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={overdue ? "destructive" : "secondary"}>
                      {overdue && <AlertCircle className="h-3 w-3 mr-1" />}
                      Due {new Date(l.dueAt).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        <TabsContent value="history" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <Empty text="Nothing in your history yet." />
          ) : (
            past.map((l) => {
              const book = bookService.get(l.bookId);
              return (
                <Card key={l.id}>
                  <CardContent className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{book?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Returned {l.returnedAt ? new Date(l.returnedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
        {text}
      </CardContent>
    </Card>
  );
}
