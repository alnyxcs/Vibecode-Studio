import { Download, FileText, Blocks, Bot, Sparkles, Terminal, FolderOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildExportZip } from "@/lib/exporters";
import { useI18n } from "@/lib/i18n";
import { downloadBlob } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { type AppDataSnapshot } from "@/types";

interface HomePageProps {
  snapshot: AppDataSnapshot;
}

export function HomePage({ snapshot }: HomePageProps) {
  const { t } = useI18n();
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-8 md:p-12">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-glow">
              <Blocks className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">VibeCode Studio</h1>
              <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{t("home.heroDesc")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setActiveView("skills")}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t("home.createSkill")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveView("subagents")}>
              <Bot className="mr-2 h-4 w-4" />
              {t("home.createAgent")}
            </Button>
          </div>
        </div>
      </div>

      <SectionHeader
        eyebrow={t("home.guideEyebrow")}
        title={t("home.guideTitle")}
        description={t("home.guideDesc")}
      />

      <div className="relative space-y-0">
        <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border/60 xl:left-[23px]" />

        <div className="relative flex gap-6 pb-8">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card text-lg font-bold text-primary">1</div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold">{t("home.step1Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.step1Body")}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{t("platform.opencode")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.installOpenCodeDesc")}</p>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# macOS / Linux
curl -fsSL https://opencode.ai/install | bash

# Windows (PowerShell)
irm https://opencode.ai/install.ps1 | iex

# Or with Go
go install github.com/opencode-ai/opencode@latest`}
                  </pre>
                  <p className="text-xs text-muted-foreground">{t("home.installOpenCodeNote")}</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{t("platform.claude")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.installClaudeDesc")}</p>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Then run in your project folder
cd your-project
claude`}
                  </pre>
                  <p className="text-xs text-muted-foreground">{t("home.installClaudeNote")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative flex gap-6 pb-8">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card text-lg font-bold text-primary">2</div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold">{t("home.step2Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.step2Body")}</p>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t("home.step2SkillTitle")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.step2SkillBody")}</p>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`---
name: Code Reviewer
description: Finds bugs and risks
model: sonnet-4
temperature: 0.2
tools:
  - Read
  - Grep
  - Glob
---

# Code Reviewer

## Focus
- regressions
- missing validation
- test coverage gaps

## Output
1. Findings by severity
2. File references
3. Fix suggestions`}
                  </pre>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("skills")}>
                    {t("home.step2SkillCta")}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t("home.step2AgentTitle")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.step2AgentBody")}</p>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`---
name: reviewer
description: Focused code review agent
preferredModel: sonnet-4
allowedTools:
  - Read
  - Grep
  - Glob
preloadedSkills:
  - Code Reviewer
usageExamples:
  - "@reviewer inspect this PR"
  - "@reviewer find release blockers"
---

You review diffs for bugs and risk.
Findings come first. Call out likely
regressions and missing tests.`}
                  </pre>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("subagents")}>
                    {t("home.step2AgentCta")}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative flex gap-6 pb-8">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card text-lg font-bold text-primary">3</div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold">{t("home.step3Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.step3Body")}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t("platform.opencode")}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.step3OpenCodeBody")}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const blob = await buildExportZip("opencode", snapshot);
                        downloadBlob(blob, "vibecode-studio-opencode.zip");
                        toast.success(t("toast.zipCreated"));
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("home.downloadOpenCode")}
                    </Button>
                  </div>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# Unzip into your project root
unzip vibecode-studio-opencode.zip -d .

# Result:
.opencode/
  skills/
    reviewer/SKILL.md
  agents/
    planner.md`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t("platform.claude")}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("home.step3ClaudeBody")}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const blob = await buildExportZip("claude", snapshot);
                        downloadBlob(blob, "vibecode-studio-claude.zip");
                        toast.success(t("toast.zipCreated"));
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("home.downloadClaude")}
                    </Button>
                  </div>
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# Unzip into your project root
unzip vibecode-studio-claude.zip -d .

# Result:
.claude/
  skills/
    reviewer/SKILL.md
  agents/
    planner.md`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative flex gap-6 pb-8">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card text-lg font-bold text-primary">4</div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold">{t("home.step4Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.step4Body")}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-emerald-500" />
                    <CardTitle className="text-base">{t("home.step4OpenCodeTitle")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# Navigate to your project
cd my-project

# OpenCode auto-loads .opencode/ on start
opencode

# Skills are loaded automatically.
# Call agents by name:
#   @reviewer inspect this PR
#   @planner decompose the migration`}
                  </pre>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{t("home.step4OpenCodeTip1")}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{t("home.step4OpenCodeTip2")}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{t("home.step4OpenCodeTip3")}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-orange-500" />
                    <CardTitle className="text-base">{t("home.step4ClaudeTitle")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
{`# Navigate to your project
cd my-project

# Start Claude Code
claude

# Skills are loaded automatically.
# Call agents by name:
#   @reviewer inspect this PR
#   @planner decompose the migration`}
                  </pre>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{t("home.step4ClaudeTip1")}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{t("home.step4ClaudeTip2")}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{t("home.step4ClaudeTip3")}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="relative flex gap-6">
          <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card text-lg font-bold text-primary">5</div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold">{t("home.step5Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.step5Body")}</p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t("home.step5Check1Title")}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.step5Check1Body")}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t("home.step5Check2Title")}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.step5Check2Body")}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t("home.step5Check3Title")}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.step5Check3Body")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/60 bg-background/40 shadow-sm">
          <CardHeader>
            <CardTitle>{t("home.glossaryTitle")}</CardTitle>
            <CardDescription>{t("home.glossaryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.termSkillTitle")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.termSkillBody")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.termSubagentTitle")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.termSubagentBody")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.termProjectTitle")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.termProjectBody")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.termExportTitle")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.termExportBody")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/40 shadow-sm">
          <CardHeader>
            <CardTitle>{t("home.faqTitle")}</CardTitle>
            <CardDescription>{t("home.faqDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.faq1Q")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.faq1A")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.faq2Q")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.faq2A")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.faq3Q")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.faq3A")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <div className="font-medium">{t("home.faq4Q")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("home.faq4A")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
