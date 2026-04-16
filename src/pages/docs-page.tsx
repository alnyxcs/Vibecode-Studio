import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/section-header";
import { useI18n } from "@/lib/i18n";

export function DocsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("docs.eyebrow")}
        title={t("docs.title")}
        description={t("docs.description")}
      />

      <Card className="bg-background/40">
        <CardHeader>
          <CardTitle>{t("docs.beginnerTitle")}</CardTitle>
          <CardDescription>{t("docs.beginnerDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="font-medium">{t("docs.beginner1Title")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t("docs.beginner1Body")}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="font-medium">{t("docs.beginner2Title")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t("docs.beginner2Body")}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="font-medium">{t("docs.beginner3Title")}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t("docs.beginner3Body")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.openCode")}</CardTitle>
            <CardDescription>{t("docs.openCodeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
{`.opencode/
  skills/
    reviewer/SKILL.md
  agents/
    planner.md`}
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.claude")}</CardTitle>
            <CardDescription>{t("docs.claudeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
{`.claude/
  skills/
    reviewer/SKILL.md
  agents/
    planner.md`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/40">
        <CardHeader>
          <CardTitle>{t("docs.quick")}</CardTitle>
          <CardDescription>{t("docs.quickDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="frontmatter">
              <AccordionTrigger>{t("docs.q1")}</AccordionTrigger>
              <AccordionContent>{t("docs.a1")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="subagents">
              <AccordionTrigger>{t("docs.q2")}</AccordionTrigger>
              <AccordionContent>{t("docs.a2")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="visibility">
              <AccordionTrigger>{t("docs.q3")}</AccordionTrigger>
              <AccordionContent>{t("docs.a3")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="testing">
              <AccordionTrigger>{t("docs.q4")}</AccordionTrigger>
              <AccordionContent>{t("docs.a4")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.guides")}</CardTitle>
            <CardDescription>{t("docs.guidesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="guide-skill">
                <AccordionTrigger>{t("docs.g1")}</AccordionTrigger>
                <AccordionContent>{t("docs.g1a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="guide-subagent">
                <AccordionTrigger>{t("docs.g2")}</AccordionTrigger>
                <AccordionContent>{t("docs.g2a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="guide-split">
                <AccordionTrigger>{t("docs.g3")}</AccordionTrigger>
                <AccordionContent>{t("docs.g3a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="guide-export">
                <AccordionTrigger>{t("docs.g4")}</AccordionTrigger>
                <AccordionContent>{t("docs.g4a")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.workflowTitle")}</CardTitle>
            <CardDescription>{t("docs.workflowDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="font-medium">{t("docs.workflow1Title")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("docs.workflow1Body")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="font-medium">{t("docs.workflow2Title")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("docs.workflow2Body")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="font-medium">{t("docs.workflow3Title")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("docs.workflow3Body")}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="font-medium">{t("docs.workflow4Title")}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t("docs.workflow4Body")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.patternsSkillCard")}</CardTitle>
            <CardDescription>{t("docs.patternsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">{t("docs.skillPatternTitle")}</div>
              <pre className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">{`# Skill Name

## Responsibilities
- define the job clearly
- state hard constraints
- keep the output stable

## Output
- summary
- findings
- next steps

## Examples
- when to use
- when not to use`}</pre>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("docs.patternsSubagentCard")}</CardTitle>
            <CardDescription>{t("docs.patternsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">{t("docs.subagentPatternTitle")}</div>
              <pre className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">{`You are @reviewer.

Focus:
- code review
- regression risk
- missing tests

Rules:
- use only approved tools
- keep changes minimal
- escalate uncertainty quickly

Examples:
@reviewer inspect this PR for risky state bugs`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
