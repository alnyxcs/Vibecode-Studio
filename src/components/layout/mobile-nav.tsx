import { ArchiveRestore, BookOpenText, Bot, FolderKanban, Home, LayoutDashboard, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/store/use-app-store";
import { type AppView } from "@/types";
import { cn } from "@/lib/utils";

const items: { id: AppView; labelKey: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", labelKey: "nav.home", icon: Home },
  { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { id: "skills", labelKey: "nav.skills", icon: Sparkles },
  { id: "subagents", labelKey: "nav.agents", icon: Bot },
  { id: "projects", labelKey: "nav.projects", icon: FolderKanban },
  { id: "export", labelKey: "common.export", icon: ArchiveRestore },
  { id: "docs", labelKey: "nav.docs", icon: BookOpenText },
];

export function MobileNav() {
  const { t } = useI18n();
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/90 px-2 py-2 backdrop-blur xl:hidden">
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-label={t(item.labelKey)}
              title={t(item.labelKey)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] leading-tight text-muted-foreground transition sm:text-[11px]",
                active && "bg-accent text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full text-center leading-tight">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
