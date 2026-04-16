import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
}

export function SectionHeader({ eyebrow, title, description, action, secondaryAction }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <Badge className="mb-3">{eyebrow}</Badge> : null}
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action || secondaryAction ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
          {secondaryAction ? (
            <Button className="w-full sm:w-auto" variant={secondaryAction.variant ?? "outline"} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
          {action ? (
            <Button className="w-full sm:w-auto" variant={action.variant ?? "default"} onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
