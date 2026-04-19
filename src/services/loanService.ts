import type { Loan } from "@/lib/types";
import { readCollection, uid, writeCollection } from "@/lib/storage";
import { bookService } from "./bookService";
import { requestService } from "./requestService";

const KEY = "loans";

function load(): Loan[] {
  return readCollection<Loan>(KEY);
}
function save(items: Loan[]) {
  writeCollection(KEY, items);
}

export const loanService = {
  list(): Loan[] {
    return load();
  },
  byStudent(studentId: string): Loan[] {
    return load().filter((l) => l.studentId === studentId);
  },
  active(): Loan[] {
    return load().filter((l) => l.status === "active");
  },
  isOverdue(loan: Loan): boolean {
    return loan.status === "active" && new Date(loan.dueAt).getTime() < Date.now();
  },
  createFromRequest(input: {
    requestId: string;
    bookId: string;
    studentId: string;
    dueAt: string;
    classGrade?: string;
  }): Loan | { error: string } {
    const book = bookService.get(input.bookId);
    if (!book) return { error: "Book not found" };
    if (book.availableCopies <= 0) return { error: "No copies available" };
    const loan: Loan = {
      id: uid(),
      bookId: input.bookId,
      studentId: input.studentId,
      requestId: input.requestId,
      borrowedAt: new Date().toISOString(),
      dueAt: input.dueAt,
      status: "active",
      classGrade: input.classGrade,
    };
    const items = load();
    items.push(loan);
    save(items);
    bookService.adjustAvailable(input.bookId, -1);
    requestService.markFulfilled(input.requestId);
    return loan;
  },
  markReturned(id: string): Loan | undefined {
    const items = load();
    const idx = items.findIndex((l) => l.id === id);
    if (idx === -1 || items[idx].status === "returned") return items[idx];
    items[idx] = { ...items[idx], status: "returned", returnedAt: new Date().toISOString() };
    save(items);
    bookService.adjustAvailable(items[idx].bookId, +1);
    return items[idx];
  },
};
