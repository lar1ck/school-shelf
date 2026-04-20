import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, LogOut, Library, Users, ClipboardList, BookMarked, LayoutDashboard, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const librarianNav: NavItem[] = [
  { to: "/librarian", label: "Dashboard", icon: LayoutDashboard },
  { to: "/librarian/catalog", label: "Catalog", icon: Library },
  { to: "/librarian/requests", label: "Requests", icon: ClipboardList },
  { to: "/librarian/loans", label: "Loans", icon: BookMarked },
  { to: "/librarian/students", label: "Students", icon: Users },
];

const studentNav: NavItem[] = [
  { to: "/student", label: "Browse", icon: Search },
  { to: "/student/requests", label: "My Requests", icon: ClipboardList },
  { to: "/student/loans", label: "My Loans", icon: BookMarked },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return <>{children}</>;

  const nav = user.role === "librarian" ? librarianNav : studentNav;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">LBMS</span>
          </Link>
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || (item.to !== "/librarian" && item.to !== "/student" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "librarian" ? "default" : "secondary"} className="hidden sm:inline-flex capitalize">
              {user.role}
            </Badge>
            <AccountSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
