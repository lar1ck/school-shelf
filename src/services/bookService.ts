import type { Book } from "@/lib/types";
import { readCollection, uid, writeCollection } from "@/lib/storage";

const KEY = "books";

function load(): Book[] {
  return readCollection<Book>(KEY);
}
function save(books: Book[]) {
  writeCollection(KEY, books);
}

export const bookService = {
  list(): Book[] {
    return load();
  },
  get(id: string): Book | undefined {
    return load().find((b) => b.id === id);
  },
  create(input: Omit<Book, "id" | "createdAt" | "availableCopies"> & { availableCopies?: number }): Book {
    const book: Book = {
      ...input,
      availableCopies: input.availableCopies ?? input.totalCopies,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    const books = load();
    books.push(book);
    save(books);
    return book;
  },
  update(id: string, patch: Partial<Omit<Book, "id" | "createdAt">>): Book | undefined {
    const books = load();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    books[idx] = { ...books[idx], ...patch };
    save(books);
    return books[idx];
  },
  remove(id: string): void {
    save(load().filter((b) => b.id !== id));
  },
  adjustAvailable(id: string, delta: number): void {
    const books = load();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const next = Math.max(0, Math.min(books[idx].totalCopies, books[idx].availableCopies + delta));
    books[idx] = { ...books[idx], availableCopies: next };
    save(books);
  },
  search(query: string): Book[] {
    const q = query.trim().toLowerCase();
    if (!q) return load();
    return load().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q),
    );
  },
};
