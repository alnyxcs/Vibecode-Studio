import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { wouldCreateSubagentCycle } from "@/lib/snapshot";
import { createId, parseList } from "@/lib/utils";
import { modelOptions, toolOptions } from "@/lib/constants";
import { useAppStore } from "@/store/use-app-store";
import { type GeneratedSubagentDraft, type Subagent } from "@/types";

type SubagentFormValues = {
  name: string;
  rolePrompt: string;
  description: string;
  preferredModel: string;
  preloadedSkillIds: string[];
  allowedTools: string[];
  contextBehavior: "separate" | "share";
  parentId: string | null;
  usageExamples: string;
  visibility: "global" | "project";
  projectId: string | null;
  platforms: "opencode" | "claude" | "both";
};

interface SubagentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subagent?: Subagent | null;
  initialDraft?: GeneratedSubagentDraft | null;
}

export function SubagentFormDialog({ open, onOpenChange, subagent, initialDraft }: SubagentFormDialogProps) {
  const { t } = useI18n();
  const [showAdvanced, setShowAdvanced] = useState(Boolean(subagent));
  const projects = useAppStore((state) => state.projects);
  const skills = useAppStore((state) => state.skills);
  const subagents = useAppStore((state) => state.subagents);
  const upsertSubagent = useAppStore((state) => state.upsertSubagent);

  const subagentSchema = useMemo(
    () => z.object({
      name: z.string().min(2, t("subagentForm.nameRequired")),
      rolePrompt: z.string().min(20, t("subagentForm.rolePromptRequired")),
      description: z.string().min(4, t("subagentForm.descriptionRequired")),
      preferredModel: z.string().min(1),
      preloadedSkillIds: z.array(z.string()),
      allowedTools: z.array(z.string()).min(1, t("subagentForm.toolsRequired")),
      contextBehavior: z.enum(["separate", "share"]),
      parentId: z.string().nullable(),
      usageExamples: z.string(),
      visibility: z.enum(["global", "project"]),
      projectId: z.string().nullable(),
      platforms: z.enum(["opencode", "claude", "both"]),
    }),
    [t],
  );

  const defaultValues: SubagentFormValues = useMemo(
    () => ({
      name: subagent?.name ?? initialDraft?.name ?? "",
      rolePrompt: subagent?.rolePrompt ?? initialDraft?.rolePrompt ?? t("subagentForm.defaultRolePrompt"),
      description: subagent?.description ?? initialDraft?.description ?? "",
      preferredModel: subagent?.preferredModel ?? initialDraft?.preferredModel ?? "sonnet-4",
      preloadedSkillIds: subagent?.preloadedSkillIds ?? initialDraft?.preloadedSkillIds ?? [],
      allowedTools: subagent?.allowedTools ?? initialDraft?.allowedTools ?? ["Read", "Glob", "Grep"],
      contextBehavior: subagent?.contextBehavior ?? initialDraft?.contextBehavior ?? "separate",
      parentId: subagent?.parentId ?? initialDraft?.parentId ?? null,
      usageExamples: subagent?.usageExamples.join("\n") ?? initialDraft?.usageExamples.join("\n") ?? t("subagentForm.defaultUsageExample"),
      visibility: subagent?.visibility ?? initialDraft?.visibility ?? "global",
      projectId: subagent?.projectId ?? initialDraft?.projectId ?? projects[0]?.id ?? null,
      platforms: subagent?.platforms ?? initialDraft?.platforms ?? "both",
    }),
    [initialDraft, projects, subagent, t],
  );

  const form = useForm<SubagentFormValues>({
    resolver: zodResolver(subagentSchema),
    values: defaultValues,
  });

  const values = form.watch();

  const availableParentSubagents = useMemo(
    () => subagents.filter((item) => item.id !== subagent?.id && !wouldCreateSubagentCycle(subagents, subagent?.id ?? "draft-subagent", item.id)),
    [subagent?.id, subagents],
  );

  const submit = form.handleSubmit((data) => {
    const nextId = subagent?.id ?? createId("agent");
    const parentId = wouldCreateSubagentCycle(subagents, nextId, data.parentId) ? null : data.parentId;

    upsertSubagent({
      id: nextId,
      name: data.name,
      rolePrompt: data.rolePrompt,
      description: data.description,
      preferredModel: data.preferredModel,
      preloadedSkillIds: data.preloadedSkillIds,
      allowedTools: data.allowedTools,
      contextBehavior: data.contextBehavior,
      parentId,
      usageExamples: parseList(data.usageExamples),
      visibility: data.visibility,
      projectId: data.visibility === "project" ? data.projectId : null,
      platforms: data.platforms,
      updatedAt: new Date().toISOString(),
    });

    onOpenChange(false);
    form.reset(defaultValues);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[96vw] xl:max-w-[1360px]">
          <DialogHeader className="px-6 pt-6">
          <DialogTitle>{subagent ? t("subagentForm.editTitle") : t("subagentForm.newTitle")}</DialogTitle>
          <DialogDescription>{t("subagentForm.description")}</DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={submit} className="grid max-h-[calc(92vh-88px)] min-h-0 grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <ScrollArea className="min-h-0 max-h-[calc(92vh-88px)] border-b border-border/60 px-4 pb-6 sm:px-6 xl:border-b-0 xl:border-r">
              <div className="space-y-5 pb-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subagentForm.nameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("subagentForm.namePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage name="name" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.description")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("subagentForm.descriptionPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage name="description" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{t("common.basicMode")}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subagentForm.basicHelp")}</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowAdvanced((current) => !current)}>
                    {showAdvanced ? t("common.hideAdvanced") : t("common.showAdvanced")}
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="rolePrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subagentForm.rolePrompt")}</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[240px]" placeholder={t("subagentForm.rolePromptPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage name="rolePrompt" />
                    </FormItem>
                  )}
                />

                {showAdvanced ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="preferredModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subagentForm.preferredModel")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelOptions.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contextBehavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subagentForm.contextBehavior")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="separate">{t("subagentForm.separateContext")}</SelectItem>
                            <SelectItem value="share">{t("subagentForm.shareContext")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.platforms")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="both">{t("common.both")}</SelectItem>
                            <SelectItem value="opencode">{t("platform.opencode")}</SelectItem>
                            <SelectItem value="claude">{t("platform.claude")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div> : null}

                {showAdvanced ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.visibility")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="global">{t("common.global")}</SelectItem>
                            <SelectItem value="project">{t("common.project")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subagentForm.projectScope")}</FormLabel>
                        <Select value={field.value ?? projects[0]?.id} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger disabled={values.visibility !== "project"}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("subagentForm.parentSubagent")}</FormLabel>
                        <Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? null : value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t("subagentForm.noParent")}</SelectItem>
                            {availableParentSubagents.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  @{item.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div> : null}

                {showAdvanced ? <FormField
                  control={form.control}
                  name="preloadedSkillIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subagentForm.preloadedSkills")}</FormLabel>
                      <MultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={skills.map((skill) => ({ value: skill.id, label: skill.name, description: skill.description }))}
                        placeholder={t("subagentForm.noSkills")}
                      />
                    </FormItem>
                  )}
                /> : null}

                {showAdvanced ? <FormField
                  control={form.control}
                  name="allowedTools"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subagentForm.allowedTools")}</FormLabel>
                      <MultiSelect value={field.value} onChange={field.onChange} options={toolOptions.map((tool) => ({ value: tool, label: tool }))} />
                      <FormMessage name="allowedTools" />
                    </FormItem>
                  )}
                /> : null}

                <FormField
                  control={form.control}
                  name="usageExamples"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subagentForm.usageExamples")}</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[140px]" placeholder={t("subagentForm.usagePlaceholder")} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex min-h-0 flex-col gap-4 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                <div className="text-sm font-semibold">{t("common.preview")}</div>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">{t("subagentForm.mention")}</div>
                     <div className="mt-1 text-lg font-semibold">@{values.name || t("subagentForm.previewName")}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t("subagentForm.rolePromptPreview")}</div>
                    <p className="mt-1 max-h-[260px] overflow-auto whitespace-pre-wrap rounded-xl border border-border/60 bg-background/60 p-3 text-muted-foreground">
                      {values.rolePrompt}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-muted-foreground">{t("common.model")}</div>
                      <div className="mt-1">{values.preferredModel}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t("common.context")}</div>
                      <div className="mt-1">{values.contextBehavior === "share" ? t("subagentForm.shareContext") : t("subagentForm.separateContext")}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                <div className="text-sm font-semibold">{t("subagentForm.usageExamples")}</div>
                <div className="mt-3 max-h-[220px] space-y-2 overflow-auto pr-1">
                  {parseList(values.usageExamples || "").map((example) => (
                    <div key={example} className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                      {example}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col-reverse justify-end gap-3 border-t border-border/60 pt-4 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("subagentForm.save")}</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
