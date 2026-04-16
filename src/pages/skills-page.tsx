import { Suspense, lazy, useMemo, useState } from "react";
import { Eye, FilePenLine, Plus, TestTube2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { coerceSkillDraft } from "@/lib/ai-generator";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { textPreview, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { type GeneratedSkillDraft, type Skill } from "@/types";

const AiAssistantDialog = lazy(() => import("@/components/ai/ai-assistant-dialog").then((module) => ({ default: module.AiAssistantDialog })));
const SkillFormDialog = lazy(() => import("@/components/skills/skill-form-dialog").then((module) => ({ default: module.SkillFormDialog })));
const SkillPreviewDialog = lazy(() => import("@/components/skills/skill-preview-dialog").then((module) => ({ default: module.SkillPreviewDialog })));
const TestPromptDialog = lazy(() => import("@/components/shared/test-prompt-dialog").then((module) => ({ default: module.TestPromptDialog })));

interface SkillsPageProps {
  skills: Skill[];
}

export function SkillsPage({ skills }: SkillsPageProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [draft, setDraft] = useState<GeneratedSkillDraft | null>(null);
  const [testSkill, setTestSkill] = useState<Skill | null>(null);
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);
  const [confirmSkill, setConfirmSkill] = useState<Skill | null>(null);
  const deleteSkill = useAppStore((state) => state.deleteSkill);
  const allSkills = useAppStore((state) => state.skills);

  const sortedSkills = useMemo(() => [...skills].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)), [skills]);
  const showDialogs = open || aiOpen || Boolean(testSkill) || Boolean(previewSkill);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("skills.eyebrow")}
        title={t("skills.title")}
        description={t("skills.description")}
        secondaryAction={{
          label: t("skills.generate"),
          onClick: () => setAiOpen(true),
          variant: "outline",
        }}
        action={{
          label: t("skills.new"),
          onClick: () => {
            setSelected(null);
            setDraft(null);
            setOpen(true);
          },
        }}
      />

      {sortedSkills.length === 0 ? (
        <EmptyState icon={Plus} title={t("skills.emptyTitle")} description={t("skills.emptyDesc")} actionLabel={t("skills.create")} onAction={() => setOpen(true)} />
      ) : (
        <Card className="bg-background/40">
          <CardContent className="p-0">
            <div className="space-y-4 p-4 md:hidden">
              {sortedSkills.map((skill) => (
                <div key={skill.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{skill.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{textPreview(skill.description, 120)}</p>
                    </div>
                    <PlatformBadge platform={skill.platforms} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skill.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">{t("common.updated")} {formatDate(skill.updatedAt, locale)}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setTestSkill(skill)}>
                      <TestTube2 className="mr-2 h-4 w-4" />
                      {t("common.test")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewSkill(skill)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t("common.preview")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelected(skill);
                        setOpen(true);
                      }}
                    >
                      <FilePenLine className="mr-2 h-4 w-4" />
                      {t("common.edit")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmSkill(skill)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <Table className="min-w-[920px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.description")}</TableHead>
                    <TableHead>{t("skills.platform")}</TableHead>
                    <TableHead>{t("skills.tags")}</TableHead>
                    <TableHead>{t("common.updated")}</TableHead>
                    <TableHead className="text-right">{t("skills.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell className="max-w-sm text-muted-foreground">{textPreview(skill.description, 90)}</TableCell>
                      <TableCell>
                        <PlatformBadge platform={skill.platforms} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {skill.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(skill.updatedAt, locale)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon" title={t("common.test")} aria-label={t("common.test")} onClick={() => setTestSkill(skill)}>
                            <TestTube2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={t("common.edit")}
                            aria-label={t("common.edit")}
                            onClick={() => {
                              setSelected(skill);
                              setOpen(true);
                            }}
                          >
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title={t("common.preview")} aria-label={t("common.preview")} onClick={() => setPreviewSkill(skill)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title={t("common.delete")} aria-label={t("common.delete")} onClick={() => setConfirmSkill(skill)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showDialogs ? (
        <Suspense fallback={null}>
          <SkillFormDialog open={open} onOpenChange={setOpen} skill={selected} initialDraft={draft} />
          <AiAssistantDialog
            open={aiOpen}
            onOpenChange={setAiOpen}
            kind="skill"
            onSkillGenerated={(value) => {
              setSelected(null);
              setDraft(coerceSkillDraft(value, allSkills));
              setOpen(true);
            }}
          />
          <SkillPreviewDialog open={Boolean(previewSkill)} onOpenChange={(next) => !next && setPreviewSkill(null)} skill={previewSkill} />
          <TestPromptDialog open={Boolean(testSkill)} onOpenChange={(next) => !next && setTestSkill(null)} title={testSkill ? `${testSkill.name} ${t("skills.testPayload")}` : ""} prompt={testSkill ? testSkill.content : ""} />
        </Suspense>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmSkill)}
        onOpenChange={(next) => !next && setConfirmSkill(null)}
        title={t("confirm.deleteSkillTitle")}
        description={confirmSkill ? t("confirm.deleteSkillDesc").replace("{name}", confirmSkill.name) : ""}
        onConfirm={() => {
          if (confirmSkill) {
            deleteSkill(confirmSkill.id);
          }
        }}
      />
    </div>
  );
}
