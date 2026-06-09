import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const sizes = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function UserAvatar({
  user,
  size = "md",
  className,
  ring,
}: {
  user?: Pick<User, "initials" | "avatarColor" | "name"> | null;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
}) {
  if (!user) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
          sizes[size],
          className,
        )}
      >
        ?
      </div>
    );
  }
  return (
    <div
      title={user.name}
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        ring && "ring-2 ring-background",
        className,
      )}
      style={{ backgroundColor: user.avatarColor }}
    >
      {user.initials}
    </div>
  );
}

export function AvatarStack({
  users,
  max = 4,
  size = "sm",
}: {
  users: (Pick<User, "initials" | "avatarColor" | "name"> | undefined)[];
  max?: number;
  size?: keyof typeof sizes;
}) {
  const visible = users.filter(Boolean).slice(0, max) as User[];
  const extra = users.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((u) => (
        <UserAvatar key={u.id} user={u} size={size} ring />
      ))}
      {extra > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background",
            sizes[size],
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
