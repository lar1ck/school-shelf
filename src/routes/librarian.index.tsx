import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookMarked, ClipboardList, Library, AlertCircle, Users } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/bookService";
import { requestService } from "@/services/requestService";
import { loanService } from "@/services/loanService";
import { userService } from "@/services/userService";

export const Route = createFileRoute("/librarian/")({
  head: () => ({
    meta: [
      { title: "Librarian Dashboard — LBMS" },
      { name: "description", content: "Library overview: catalog, requests, loans, and overdue books." },
    ],
  }),
  component: () => (
    <RoleGate role="librarian">
      <Dashboard />
    </RoleGate>
  ),
});

function Dashboard() {
  const [stats, setStats] = useState({ books: 0, copies: 0, available: 0, pending: 0, active: 0, overdue: 0, students: 0 });

  useEffect(() => {
    const books = bookService.list();
    const loans = loanService.list();
    setStats({
      books: books.length,
      copies: books.reduce((s, b) => s + b.totalCopies, 0),
      available: books.reduce((s, b) => s + b.availableCopies, 0),
      pending: requestService.byStatus("pending").length,
      active: loans.filter((l) => l.status === "active").length,
      overdue: loans.filter((l) => loanService.isOverdue(l)).length,
      students: userService.byRole("student").length,
    });
  }, []);

  const cards = [
    { label: "Titles in catalog", value: stats.books, icon: Library, to: "/librarian/catalog" },
    { label: "Available copies", value: `${stats.available} / ${stats.copies}`, icon: BookMarked, to: "/librarian/catalog" },
    { label: "Pending requests", value: stats.pending, icon: ClipboardList, to: "/librarian/requests", accent: stats.pending > 0 },
    { label: "Active loans", value: stats.active, icon: BookMarked, to: "/librarian/loans" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, to: "/librarian/loans", warn: stats.overdue > 0 },
    { label: "Students", value: stats.students, icon: Users, to: "/librarian/students" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's library at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {c.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${c.warn ? "text-destructive" : c.accent ? "text-primary" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-semibold ${c.warn ? "text-destructive" : ""}`}>{c.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
