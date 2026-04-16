import { useMemo, useState } from "react";
import { Bot, FilePenLine, Plus, TestTube2, Trash2 } from "lucide-react";
import { AiAssistantDialog } from "@/components/ai/ai-assistant-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { HierarchyTree } from "@/components/shared/hierarchy-tree";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { TestPromptDialog } from "@/components/shared/test-prompt-dialog";
import { SubagentFormDialog } from "@/components/subagents/subagent-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coerceSubagentDraft } from "@/lib/ai-generator";
import { useI18n } from "@/lib/i18n";
import { formatDate, textPreview } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { type GeneratedSubagentDraft, type Subagent } from "@/types";

interface SubagentsPageProps {
  subagents: Subagent[];
}

export function SubagentsPage({ subagents }: SubagentsPageProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [selected, setSelected] = useState<Subagent | null>(null);
  const [draft, setDraft] = useState<GeneratedSubagentDraft | null>(null);
  const [testSubagent, setTestSubagent] = useState<Subagent | null>(null);
  const [confirmSubagent, setConfirmSubagent] = useState<Subagent | null>(null);
  const deleteSubagent = useAppStore((state) => state.deleteSubagent);
  const upsertSubagent = useAppStore((state) => state.upsertSubagent);

  const sortedSubagents = useMemo(() => [...subagents].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)), [subagents]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("subagents.eyebrow")}
        title={t("subagents.title")}
        description={t("subagents.description")}
        secondaryAction={{
          label: t("subagents.generate"),
          onClick: () => setAiOpen(true),
          variant: "outline",
        }}
        action={{
          label: t("subagents.new"),
          onClick: () => {
            setSelected(null);
            setDraft(null);
            setOpen(true);
          },
        }}
      />

      {sortedSubagents.length === 0 ? (
        <EmptyState icon={Bot} title={t("subagents.emptyTitle")} description={t("subagents.emptyDesc")} actionLabel={t("subagents.create")} onAction={() => setOpen(true)} />
      ) : (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{t("subagents.table")}</TabsTrigger>
            <TabsTrigger value="hierarchy">{t("subagents.hierarchy")}</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card className="bg-background/40">
              <CardContent className="p-0">
                <div className="space-y-4 p-4 md:hidden">
                  {sortedSubagents.map((subagent) => (
                    <div key={subagent.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">@{subagent.name}</div>
                          <p className="mt-1 text-sm text-muted-foreground">{textPreview(subagent.description, 120)}</p>
                        </div>
                        <PlatformBadge platform={subagent.platforms} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{subagent.preferredModel}</Badge>
                        {subagent.allowedTools.slice(0, 3).map((tool) => (
                          <span key={tool} className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground">{tool}</span>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">{t("common.updated")} {formatDate(subagent.updatedAt, locale)}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setTestSubagent(subagent)}>
                          <TestTube2 className="mr-2 h-4 w-4" />
                          {t("common.test")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(subagent);
                            setOpen(true);
                          }}
                        >
                          <FilePenLine className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmSubagent(subagent)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <Table className="min-w-[980px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.name")}</TableHead>
                        <TableHead>{t("common.description")}</TableHead>
                        <TableHead>{t("subagents.model")}</TableHead>
                        <TableHead>{t("skills.platform")}</TableHead>
                        <TableHead>{t("subagents.tools")}</TableHead>
                        <TableHead>{t("common.updated")}</TableHead>
                        <TableHead className="text-right">{t("skills.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSubagents.map((subagent) => (
                        <TableRow key={subagent.id}>
                          <TableCell className="font-medium">@{subagent.name}</TableCell>
                          <TableCell className="max-w-sm text-muted-foreground">{textPreview(subagent.description, 90)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{subagent.preferredModel}</Badge>
                          </TableCell>
                          <TableCell>
                            <PlatformBadge platform={subagent.platforms} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {subagent.allowedTools.slice(0, 3).map((tool) => (
                                <span key={tool} className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground">{tool}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(subagent.updatedAt, locale)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button type="button" variant="ghost" size="icon" title={t("common.test")} aria-label={t("common.test")} onClick={() => setTestSubagent(subagent)}>
                                <TestTube2 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t("common.edit")}
                                aria-label={t("common.edit")}
                                onClick={() => {
                                  setSelected(subagent);
                                  setOpen(true);
                                }}
                              >
                                <FilePenLine className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" title={t("common.delete")} aria-label={t("common.delete")} onClick={() => setConfirmSubagent(subagent)}>
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
          </TabsContent>
          <TabsContent value="hierarchy">
            <HierarchyTree
              subagents={sortedSubagents}
              onMove={(subagentId, parentId) => {
                const target = sortedSubagents.find((item) => item.id === subagentId);
                if (!target) return;
                upsertSubagent({ ...target, parentId, updatedAt: new Date().toISOString() });
              }}
            />
          </TabsContent>
        </Tabs>
      )}

      <SubagentFormDialog open={open} onOpenChange={setOpen} subagent={selected} initialDraft={draft} />
      <AiAssistantDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        kind="subagent"
        onSubagentGenerated={(value) => {
          setSelected(null);
          setDraft(coerceSubagentDraft(value));
          setOpen(true);
        }}
      />
      <TestPromptDialog
        open={Boolean(testSubagent)}
        onOpenChange={(next) => !next && setTestSubagent(null)}
        title={testSubagent ? `@${testSubagent.name} ${t("skills.testPayload")}` : ""}
        prompt={testSubagent ? `${testSubagent.rolePrompt}\n\n${t("common.examples")}:\n${testSubagent.usageExamples.join("\n")}` : ""}
      />
      <ConfirmDialog
        open={Boolean(confirmSubagent)}
        onOpenChange={(next) => !next && setConfirmSubagent(null)}
        title={t("confirm.deleteSubagentTitle")}
        description={confirmSubagent ? t("confirm.deleteSubagentDesc").replace("{name}", `@${confirmSubagent.name}`) : ""}
        onConfirm={() => {
          if (confirmSubagent) {
            deleteSubagent(confirmSubagent.id);
          }
        }}
      />
    </div>
  );
}
