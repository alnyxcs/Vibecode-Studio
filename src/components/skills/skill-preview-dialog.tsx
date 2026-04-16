import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { skillToMarkdown } from "@/lib/exporters";
import { type Skill } from "@/types";

interface SkillPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill | null;
}

export function SkillPreviewDialog({ open, onOpenChange, skill }: SkillPreviewDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{skill?.name ?? t("skillPreview.title")}</DialogTitle>
          <DialogDescription>{skill?.description ?? t("skillPreview.title")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] rounded-2xl border border-border/60 bg-background/50 p-4">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{skill ? skillToMarkdown(skill) : ""}</pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
