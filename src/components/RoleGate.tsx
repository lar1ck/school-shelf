import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";

/**
 * Client-side gate. Renders children only when an authenticated user with the
 * allowed role is present. Otherwise redirects to "/".
 */
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/" });
    } else if (user.role !== role) {
      navigate({ to: user.role === "librarian" ? "/librarian" : "/student" });
    }
  }, [ready, user, role, navigate]);

  if (!ready || !user || user.role !== role) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  return <>{children}</>;
}
