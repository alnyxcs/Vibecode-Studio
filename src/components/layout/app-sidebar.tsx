import { AnimatePresence, motion } from "framer-motion";
import { ArchiveRestore, Blocks, BookOpenText, Bot, FolderKanban, Home, LayoutDashboard, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/store/use-app-store";
import { type AppView } from "@/types";
import { cn } from "@/lib/utils";

const items: { id: AppView; labelKey: string; icon: typeof LayoutDashboard; hintKey: string }[] = [
  { id: "home", labelKey: "nav.home", icon: Home, hintKey: "sidebar.homeHint" },
  { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, hintKey: "sidebar.dashboardHint" },
  { id: "skills", labelKey: "nav.skills", icon: Sparkles, hintKey: "sidebar.skillsHint" },
  { id: "subagents", labelKey: "nav.subagents", icon: Bot, hintKey: "sidebar.subagentsHint" },
  { id: "projects", labelKey: "nav.projects", icon: FolderKanban, hintKey: "sidebar.projectsHint" },
  { id: "export", labelKey: "nav.export", icon: ArchiveRestore, hintKey: "sidebar.exportHint" },
  { id: "docs", labelKey: "nav.docs", icon: BookOpenText, hintKey: "sidebar.docsHint" },
];

export function AppSidebar() {
  const { t } = useI18n();
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const projects = useAppStore((state) => state.projects);
  const skills = useAppStore((state) => state.skills);
  const subagents = useAppStore((state) => state.subagents);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const globalSkills = skills.filter((skill) => skill.visibility === "global");
  const projectSkills = skills.filter((skill) => skill.projectId === activeProjectId);
  const availableSkills = globalSkills.length + projectSkills.length;
  const globalSubagents = subagents.filter((subagent) => subagent.visibility === "global");
  const projectSubagents = subagents.filter((subagent) => subagent.projectId === activeProjectId);
  const availableSubagents = globalSubagents.length + projectSubagents.length;

  return (
    <TooltipProvider>
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-r border-border/60 bg-card/70 px-4 py-5 backdrop-blur xl:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-glow">
            <Blocks className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">VibeCode Studio</div>
            <div className="text-xs text-muted-foreground">{t("sidebar.subtitle")}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="text-sm font-medium">{t("sidebar.workspacePulse")}</div>
          <div className="mt-1 text-xs text-muted-foreground">{activeProject?.name ?? t("sidebar.noProjectSelected")}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/50 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground">{t("common.skills")}</div>
              <div className="mt-1 text-2xl font-semibold">{availableSkills}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {t("sidebar.scopeBreakdown")
                  .replace("{project}", String(projectSkills.length))
                  .replace("{global}", String(globalSkills.length))}
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground">{t("common.subagents")}</div>
              <div className="mt-1 text-2xl font-semibold">{availableSubagents}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {t("sidebar.scopeBreakdown")
                  .replace("{project}", String(projectSubagents.length))
                  .replace("{global}", String(globalSubagents.length))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge>{t("platform.opencode")}</Badge>
            <Badge variant="outline">{t("platform.claude")}</Badge>
          </div>
        </div>

        <Separator className="my-5" />

        <nav className="space-y-1 pb-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeView;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn("relative h-12 w-full justify-start gap-3 rounded-2xl px-4 text-sm", active && "bg-accent text-foreground")}
                    onClick={() => setActiveView(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                    <AnimatePresence>
                      {active ? <motion.div layoutId="sidebar-active" className="absolute inset-y-1 right-1 w-1 rounded-full bg-primary" /> : null}
                    </AnimatePresence>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t(item.hintKey)}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
