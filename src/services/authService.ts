import { readValue, writeValue } from "@/lib/storage";
import { userService } from "./userService";
import type { User } from "@/lib/types";

const ACTIVE_KEY = "activeUserId";

export const authService = {
  current(): User | null {
    const id = readValue<string>(ACTIVE_KEY);
    if (!id) return null;
    return userService.get(id) ?? null;
  },
  loginAs(userId: string): User | null {
    const user = userService.get(userId);
    if (!user) return null;
    writeValue(ACTIVE_KEY, userId);
    return user;
  },
  logout(): void {
    writeValue<string>(ACTIVE_KEY, null);
  },
};
