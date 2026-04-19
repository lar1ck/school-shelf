import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, GraduationCap, UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, ready, loginAs } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) {
      navigate({ to: user.role === "librarian" ? "/librarian" : "/student" });
    }
  }, [ready, user, navigate]);

  if (!ready) {
    return <div className="min-h-screen" />;
  }

  const users = userService.list();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Athenaeum</h1>
            <p className="text-sm text-muted-foreground">
              School library circulation, simplified.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Borrow smarter.
              <br />
              <span className="text-primary">Skip the line.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Students browse the catalog and reserve books before walking in.
              Librarians approve requests, hand out books at pickup, and track
              every loan — all without paperwork.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">ISBN auto-fill</Badge>
              <Badge variant="secondary">Request &amp; approve</Badge>
              <Badge variant="secondary">Due-date tracking</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="font-semibold">Choose an account to continue</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Demo prototype — no passwords. Switch accounts anytime from
                  the top bar.
                </p>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u.id);
                      navigate({
                        to: u.role === "librarian" ? "/librarian" : "/student",
                      });
                    }}
                    className="w-full flex items-center gap-3 rounded-lg border bg-card hover:bg-accent transition-colors px-3 py-2.5 text-left"
                  >
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                      {u.role === "librarian" ? (
                        <BookOpen className="h-4 w-4 text-primary" />
                      ) : (
                        <GraduationCap className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {u.role}
                        {u.classGrade ? ` · ${u.classGrade}` : ""}
                      </div>
                    </div>
                    <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Quick add a student demo entry
                  const name = window.prompt("Student name?");
                  if (!name) return;
                  const classGrade =
                    window.prompt("Class / grade? (e.g. 10A)") ?? undefined;
                  userService.create({
                    name,
                    role: "student",
                    classGrade: classGrade || undefined,
                    studentId: `S-${Math.floor(1000 + Math.random() * 9000)}`,
                  });
                  // force re-render via state hack
                  window.location.reload();
                }}
              >
                + Add student account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
