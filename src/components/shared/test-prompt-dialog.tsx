import { Copy, WandSparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface TestPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  prompt: string;
}

export function TestPromptDialog({ open, onOpenChange, title, prompt }: TestPromptDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WandSparkles className="h-5 w-5" />
            {t("testPrompt.title")}
          </DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] rounded-xl border border-border/60 bg-background/50 p-4">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{prompt}</pre>
        </ScrollArea>
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              await copyToClipboard(prompt);
              toast.success(t("testPrompt.copied"));
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("testPrompt.copy")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
