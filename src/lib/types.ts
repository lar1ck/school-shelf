export type Role = "librarian" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  classGrade?: string;
  studentId?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  year?: string;
  publisher?: string;
  coverUrl?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
}

export type RequestStatus = "pending" | "approved" | "rejected" | "fulfilled";

export interface BookRequest {
  id: string;
  bookId: string;
  studentId: string;
  status: RequestStatus;
  note?: string;
  createdAt: string;
  decidedAt?: string;
  fulfilledAt?: string;
}

export type LoanStatus = "active" | "returned";

export interface Loan {
  id: string;
  bookId: string;
  studentId: string;
  requestId?: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: LoanStatus;
  classGrade?: string;
}
