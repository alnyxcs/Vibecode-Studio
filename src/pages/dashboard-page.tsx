import { Bot, FolderKanban, Package, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { type Project, type Skill, type Subagent } from "@/types";

interface DashboardPageProps {
  skills: Skill[];
  subagents: Subagent[];
  projects: Project[];
}

export function DashboardPage({ skills, subagents, projects }: DashboardPageProps) {
  const { locale, t } = useI18n();
  const latestSkills = [...skills].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 4);
  const latestSubagents = [...subagents].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 4);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Sparkles} label={t("common.skills")} value={skills.length} hint={t("dashboard.skillsHint")} />
        <MetricCard icon={Bot} label={t("common.subagents")} value={subagents.length} hint={t("dashboard.subagentsHint")} />
        <MetricCard icon={FolderKanban} label={t("common.projects")} value={projects.length} hint={t("dashboard.projectsHint")} />
        <MetricCard icon={Package} label={t("common.platforms")} value="2" hint={t("dashboard.platformsHint")} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-background/40 shadow-sm">
          <CardHeader>
            <CardTitle>{t("dashboard.recentSkills")}</CardTitle>
            <CardDescription>{t("dashboard.recentSkillsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestSkills.map((skill) => (
              <div key={skill.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                  <PlatformBadge platform={skill.platforms} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border/60 px-2 py-1">#{tag}</span>
                  ))}
                  <span className="ml-auto">{t("common.updated")} {formatDate(skill.updatedAt, locale)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/40 shadow-sm">
          <CardHeader>
            <CardTitle>{t("dashboard.network")}</CardTitle>
            <CardDescription>{t("dashboard.networkDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestSubagents.map((subagent) => (
              <div key={subagent.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">@{subagent.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{subagent.description}</p>
                  </div>
                  <div className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground">{subagent.preferredModel}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {subagent.allowedTools.slice(0, 4).map((tool) => (
                    <span key={tool} className="rounded-full border border-border/60 px-2 py-1">{tool}</span>
                  ))}
                  <span className="ml-auto">{t("common.updated")} {formatDate(subagent.updatedAt, locale)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
