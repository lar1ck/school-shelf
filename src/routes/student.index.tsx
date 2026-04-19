import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, Send } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookService } from "@/services/bookService";
import { requestService } from "@/services/requestService";
import type { Book } from "@/lib/types";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Browse — Athenaeum" },
      { name: "description", content: "Browse the school library catalog and request books before pickup." },
    ],
  }),
  component: () => (
    <RoleGate role="student">
      <Browse />
    </RoleGate>
  ),
});

function Browse() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>(() => bookService.list());
  const [openReqs, setOpenReqs] = useState<Set<string>>(
    () =>
      new Set(
        requestService
          .byStudent(user!.id)
          .filter((r) => r.status === "pending" || r.status === "approved")
          .map((r) => r.bookId),
      ),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q),
    );
  }, [query, books]);

  const request = (bookId: string, title: string) => {
    if (!user) return;
    if (requestService.hasOpenRequest(user.id, bookId)) {
      toast.info("You already have an open request for this book");
      return;
    }
    requestService.create({ bookId, studentId: user.id });
    setOpenReqs((s) => new Set(s).add(bookId));
    toast.success(`Requested "${title}"`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse the library</h1>
        <p className="text-sm text-muted-foreground">
          Find a book, request it, and pick it up at the library when approved.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by title, author, or ISBN…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setBooks(bookService.list());
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
            {books.length === 0
              ? "The catalog is empty. Check back soon!"
              : "No books match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const hasOpen = openReqs.has(b.id);
            const canBorrow = b.availableCopies > 0;
            return (
              <Card key={b.id}>
                <CardContent className="p-4 flex gap-3">
                  <div className="w-16 h-24 shrink-0 rounded bg-secondary overflow-hidden flex items-center justify-center">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="font-medium leading-tight line-clamp-2">{b.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {b.author}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {b.year ? `${b.year}` : ""}
                    </div>
                    <div className="mt-auto pt-2 flex items-center gap-2">
                      <Badge variant={canBorrow ? "secondary" : "outline"}>
                        {canBorrow ? `${b.availableCopies} available` : "Unavailable"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={hasOpen ? "outline" : "default"}
                        disabled={hasOpen}
                        className="ml-auto"
                        onClick={() => request(b.id, b.title)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {hasOpen ? "Requested" : "Request"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
