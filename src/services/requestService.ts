import type { BookRequest, RequestStatus } from "@/lib/types";
import { readCollection, uid, writeCollection } from "@/lib/storage";

const KEY = "requests";

function load(): BookRequest[] {
  return readCollection<BookRequest>(KEY);
}
function save(items: BookRequest[]) {
  writeCollection(KEY, items);
}

export const requestService = {
  list(): BookRequest[] {
    return load();
  },
  get(id: string): BookRequest | undefined {
    return load().find((r) => r.id === id);
  },
  byStudent(studentId: string): BookRequest[] {
    return load().filter((r) => r.studentId === studentId);
  },
  byStatus(status: RequestStatus): BookRequest[] {
    return load().filter((r) => r.status === status);
  },
  hasOpenRequest(studentId: string, bookId: string): boolean {
    return load().some(
      (r) =>
        r.studentId === studentId &&
        r.bookId === bookId &&
        (r.status === "pending" || r.status === "approved"),
    );
  },
  create(input: { bookId: string; studentId: string }): BookRequest {
    const req: BookRequest = {
      id: uid(),
      bookId: input.bookId,
      studentId: input.studentId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const items = load();
    items.push(req);
    save(items);
    return req;
  },
  decide(id: string, decision: "approved" | "rejected", note?: string): BookRequest | undefined {
    const items = load();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (items[idx].status !== "pending") return items[idx];
    items[idx] = {
      ...items[idx],
      status: decision,
      note: note?.trim() ? note.trim() : items[idx].note,
      decidedAt: new Date().toISOString(),
    };
    save(items);
    return items[idx];
  },
  markFulfilled(id: string): BookRequest | undefined {
    const items = load();
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], status: "fulfilled", fulfilledAt: new Date().toISOString() };
    save(items);
    return items[idx];
  },
  remove(id: string): void {
    save(load().filter((r) => r.id !== id));
  },
};
