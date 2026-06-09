import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import type { Activity, User } from "@/lib/types";

export function ActivityFeed({
  items,
  userById,
}: {
  items: Activity[];
  userById: (id: string) => User | undefined;
}) {
  return (
    <ol className="relative space-y-5">
      {items.map((a, i) => {
        const user = userById(a.userId);
        return (
          <li key={a.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <UserAvatar user={user} size="sm" />
              {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="-mt-0.5 pb-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{user?.name}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <time className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
