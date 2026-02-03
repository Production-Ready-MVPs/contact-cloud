import { formatDistanceToNow } from "date-fns";
import { Users, Handshake, CheckSquare, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RecentActivity } from "@/hooks/useDashboard";

interface RecentActivityFeedProps {
  activities: RecentActivity[];
}

const entityIcons = {
  contact: Users,
  deal: Handshake,
  task: CheckSquare,
};

function getActivityDescription(activity: RecentActivity): string {
  const metadata = activity.metadata || {};
  const name = (metadata.name as string) || "Item";

  switch (activity.action) {
    case "created":
      return `Created ${activity.entityType}: ${name}`;
    case "updated":
      return `Updated ${activity.entityType}: ${name}`;
    case "deleted":
      return `Deleted ${activity.entityType}: ${name}`;
    case "stage_changed":
      return `Moved deal "${name}" to ${metadata.stage || "new stage"}`;
    case "completed":
      return `Completed task: ${name}`;
    default:
      return `${activity.action} ${activity.entityType}`;
  }
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[250px] overflow-y-auto">
      {activities.map((activity, index) => {
        const Icon = entityIcons[activity.entityType as keyof typeof entityIcons] || Activity;

        return (
          <div key={activity.id}>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{getActivityDescription(activity)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {index < activities.length - 1 && <Separator className="mt-4" />}
          </div>
        );
      })}
    </div>
  );
}
