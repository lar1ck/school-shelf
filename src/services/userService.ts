import type { Role, User } from "@/lib/types";
import { readCollection, uid, writeCollection } from "@/lib/storage";

const KEY = "users";

function load(): User[] {
  return readCollection<User>(KEY);
}
function save(users: User[]) {
  writeCollection(KEY, users);
}

export const userService = {
  list(): User[] {
    return load();
  },
  byRole(role: Role): User[] {
    return load().filter((u) => u.role === role);
  },
  get(id: string): User | undefined {
    return load().find((u) => u.id === id);
  },
  create(input: Omit<User, "id" | "createdAt">): User {
    const user: User = { ...input, id: uid(), createdAt: new Date().toISOString() };
    const users = load();
    users.push(user);
    save(users);
    return user;
  },
  update(id: string, patch: Partial<Omit<User, "id" | "createdAt">>): User | undefined {
    const users = load();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...patch };
    save(users);
    return users[idx];
  },
  remove(id: string): void {
    save(load().filter((u) => u.id !== id));
  },
  seedIfEmpty(): void {
    const users = load();
    if (users.length === 0) {
      const seed: User[] = [
        {
          id: uid(),
          name: "Ms. Carter",
          role: "librarian",
          createdAt: new Date().toISOString(),
        },
        {
          id: uid(),
          name: "Alex Johnson",
          role: "student",
          classGrade: "10A",
          studentId: "S-1001",
          createdAt: new Date().toISOString(),
        },
        {
          id: uid(),
          name: "Maya Patel",
          role: "student",
          classGrade: "11B",
          studentId: "S-1002",
          createdAt: new Date().toISOString(),
        },
      ];
      save(seed);
    }
  },
};
