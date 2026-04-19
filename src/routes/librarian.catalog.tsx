import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Library, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookService } from "@/services/bookService";
import { openLibraryService } from "@/services/openLibraryService";
import type { Book } from "@/lib/types";

export const Route = createFileRoute("/librarian/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Athenaeum" },
      { name: "description", content: "Add and manage books in the school library catalog." },
    ],
  }),
  component: () => (
    <RoleGate role="librarian">
      <Catalog />
    </RoleGate>
  ),
});

function Catalog() {
  const [books, setBooks] = useState<Book[]>(() => bookService.list());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const refresh = () => setBooks(bookService.list());

  const filtered = books.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" /> Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            {books.length} title{books.length === 1 ? "" : "s"} ·{" "}
            {books.reduce((s, b) => s + b.availableCopies, 0)} available
          </p>
        </div>
        <div className="flex gap-2 flex-1 sm:flex-none sm:w-auto w-full">
          <Input
            placeholder="Search title, author, ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-72"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add book
              </Button>
            </DialogTrigger>
            <AddBookDialog
              onClose={() => setOpen(false)}
              onCreated={() => {
                refresh();
                setOpen(false);
              }}
            />
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
            {books.length === 0
              ? "No books yet. Add the first one to start your catalog."
              : "No books match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <CardContent className="p-4 flex gap-3">
                <div className="w-16 h-24 shrink-0 rounded bg-secondary overflow-hidden flex items-center justify-center">
                  {b.coverUrl ? (
                    <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium leading-tight line-clamp-2">{b.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {b.author || "Unknown author"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.year ? `${b.year} · ` : ""}ISBN {b.isbn}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={b.availableCopies > 0 ? "secondary" : "outline"}>
                      {b.availableCopies}/{b.totalCopies} available
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(`Delete "${b.title}"?`)) {
                          bookService.remove(b.id);
                          refresh();
                          toast.success("Book removed");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBookDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [copies, setCopies] = useState("1");
  const [looking, setLooking] = useState(false);

  const lookup = async () => {
    if (!isbn.trim()) {
      toast.error("Enter an ISBN to look up");
      return;
    }
    setLooking(true);
    try {
      const data = await openLibraryService.lookup(isbn);
      if (!data) {
        toast.error("No match on Open Library — fill in manually");
        return;
      }
      setTitle(data.title);
      setAuthor(data.author);
      setYear(data.year ?? "");
      setPublisher(data.publisher ?? "");
      setCoverUrl(data.coverUrl ?? "");
      toast.success("Book details auto-filled");
    } catch {
      toast.error("Lookup failed — fill in manually");
    } finally {
      setLooking(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error("Title and author are required");
      return;
    }
    const total = Math.max(1, parseInt(copies, 10) || 1);
    bookService.create({
      isbn: isbn.trim(),
      title: title.trim(),
      author: author.trim(),
      year: year.trim() || undefined,
      publisher: publisher.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      totalCopies: total,
    });
    toast.success("Book added to catalog");
    onCreated();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add a book</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="isbn">ISBN (scan or type)</Label>
          <div className="flex gap-2">
            <Input
              id="isbn"
              placeholder="9780140328721"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
            <Button type="button" variant="secondary" onClick={lookup} disabled={looking}>
              {looking ? "Looking…" : "Auto-fill"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pulls title, author, year, publisher, and cover from Open Library.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="copies">Copies</Label>
            <Input
              id="copies"
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="publisher">Publisher</Label>
            <Input id="publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add to catalog</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
