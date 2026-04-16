import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/70 bg-background/30 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center gap-5 px-4 py-12 text-center sm:py-14">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? <Button className="w-full sm:w-auto" onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
