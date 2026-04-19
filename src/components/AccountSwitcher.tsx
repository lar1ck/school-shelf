import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/lib/auth-context";
import { userService } from "@/services/userService";
import { cn } from "@/lib/utils";

export function AccountSwitcher() {
  const { user, loginAs } = useAuth();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const users = userService.list();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[180px]">
          <UserCircle2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{user?.name ?? "Switch"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1" align="end">
        <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">
          Switch account
        </div>
        <div className="max-h-72 overflow-auto">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                loginAs(u.id);
                setOpen(false);
                navigate({ to: u.role === "librarian" ? "/librarian" : "/student" });
              }}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                user?.id === u.id && "bg-accent/60",
              )}
            >
              <UserCircle2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground capitalize">
                  {u.role}
                  {u.classGrade ? ` · ${u.classGrade}` : ""}
                </div>
              </div>
              {user?.id === u.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
