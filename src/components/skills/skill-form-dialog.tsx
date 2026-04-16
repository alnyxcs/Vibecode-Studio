import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Braces, FileText, ListChecks, Quote, Sparkles } from "lucide-react";
import YAML from "yaml";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LazyMdEditor } from "@/components/skills/lazy-md-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { skillToMarkdown } from "@/lib/exporters";
import { useI18n } from "@/lib/i18n";
import { createId, parseList } from "@/lib/utils";
import { modelOptions, permissionOptions, toolOptions } from "@/lib/constants";
import { useAppStore } from "@/store/use-app-store";
import { type GeneratedSkillDraft, type Skill } from "@/types";

type SkillFormValues = {
  name: string;
  description: string;
  content: string;
  tags?: string;
  platforms: "opencode" | "claude" | "both";
  visibility: "global" | "project";
  projectId: string | null;
  model: string;
  temperature: number;
  context: "fork" | "main";
  tools: string[];
  skills: string[];
  permissions: string[];
};

interface SkillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
  initialDraft?: GeneratedSkillDraft | null;
}

export function SkillFormDialog({ open, onOpenChange, skill, initialDraft }: SkillFormDialogProps) {
  const { t } = useI18n();
  const [showAdvanced, setShowAdvanced] = useState(Boolean(skill));
  const projects = useAppStore((state) => state.projects);
  const allSkills = useAppStore((state) => state.skills);
  const upsertSkill = useAppStore((state) => state.upsertSkill);

  const skillSchema = useMemo(
    () => z.object({
      name: z.string().min(2, t("skillForm.nameRequired")),
      description: z.string().min(4, t("skillForm.descriptionRequired")),
      content: z.string().min(10, t("skillForm.contentRequired")),
      tags: z.string().optional(),
      platforms: z.enum(["opencode", "claude", "both"]),
      visibility: z.enum(["global", "project"]),
      projectId: z.string().nullable(),
      model: z.string().min(1),
      temperature: z.coerce.number().min(0).max(1),
      context: z.enum(["fork", "main"]),
      tools: z.array(z.string()).min(1, t("skillForm.toolsRequired")),
      skills: z.array(z.string()),
      permissions: z.array(z.string()),
    }),
    [t],
  );

  const defaultValues: SkillFormValues = useMemo(
    () => ({
      name: skill?.name ?? initialDraft?.name ?? "",
      description: skill?.description ?? initialDraft?.description ?? "",
      content: skill?.content ?? initialDraft?.content ?? t("skillForm.defaultContent"),
      tags: skill?.tags.join(", ") ?? initialDraft?.tags.join(", ") ?? "",
      platforms: skill?.platforms ?? initialDraft?.platforms ?? "both",
      visibility: skill?.visibility ?? initialDraft?.visibility ?? "global",
      projectId: skill?.projectId ?? initialDraft?.projectId ?? projects[0]?.id ?? null,
      model: skill?.frontmatter.model ?? initialDraft?.frontmatter.model ?? "sonnet-4",
      temperature: skill?.frontmatter.temperature ?? initialDraft?.frontmatter.temperature ?? 0.2,
      context: skill?.frontmatter.context ?? initialDraft?.frontmatter.context ?? "main",
      tools: skill?.frontmatter.tools ?? initialDraft?.frontmatter.tools ?? ["Read", "Grep"],
      skills: skill?.frontmatter.skills ?? initialDraft?.frontmatter.skills ?? [],
      permissions: skill?.frontmatter.permissions ?? initialDraft?.frontmatter.permissions ?? ["read-only"],
    }),
    [initialDraft, projects, skill, t],
  );

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    values: defaultValues,
  });

  const values = form.watch();

  const markdownStats = useMemo(() => {
    const content = values.content || "";
    const lines = content ? content.split(/\r?\n/).length : 0;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return { lines, words, characters: content.length };
  }, [values.content]);

  const insertTemplate = (template: string) => {
    const current = form.getValues("content") || "";
    const separator = current.trim().length > 0 ? "\n\n" : "";
    form.setValue("content", `${current}${separator}${template}`, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const previewSkill: Skill = {
    id: skill?.id ?? createId("skill"),
    name: values.name || t("skillForm.untitled"),
    description: values.description || t("skillForm.noDescription"),
    content: values.content || `# ${t("skillForm.untitled")}`,
    tags: parseList(values.tags || ""),
    visibility: values.visibility,
    projectId: values.visibility === "project" ? values.projectId : null,
    platforms: values.platforms,
    updatedAt: new Date().toISOString(),
    frontmatter: {
      model: values.model,
      temperature: values.temperature,
      context: values.context,
      tools: values.tools,
      skills: values.skills,
      permissions: values.permissions,
    },
  };

  const previewMarkdown = skillToMarkdown(previewSkill);
  const yamlPreview = YAML.stringify(previewSkill.frontmatter);

  const submit = form.handleSubmit((data) => {
    upsertSkill({
      id: skill?.id ?? createId("skill"),
      name: data.name,
      description: data.description,
      content: data.content,
      tags: parseList(data.tags || ""),
      visibility: data.visibility,
      projectId: data.visibility === "project" ? data.projectId : null,
      platforms: data.platforms,
      updatedAt: new Date().toISOString(),
      frontmatter: {
        model: data.model,
        temperature: data.temperature,
        context: data.context,
        tools: data.tools,
        skills: data.skills,
        permissions: data.permissions,
      },
    });

    onOpenChange(false);
    form.reset(defaultValues);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[96vw] xl:max-w-[1400px]">
        <DialogHeader className="px-6 pt-6 pr-14">
          <DialogTitle>{skill ? t("skillForm.editTitle") : t("skillForm.newTitle")}</DialogTitle>
          <DialogDescription>{t("skillForm.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="grid max-h-[calc(92vh-88px)] min-h-0 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
            <ScrollArea className="min-h-0 max-h-[calc(92vh-88px)] border-b border-border/60 px-4 pb-6 sm:px-6 xl:border-b-0 xl:border-r">
              <div className="space-y-5 pb-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("skillForm.namePlaceholder")} {...field} />
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
                          <Input placeholder={t("skillForm.descriptionPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage name="description" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{t("common.basicMode")}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{t("skillForm.basicHelp")}</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowAdvanced((current) => !current)}>
                    {showAdvanced ? t("common.hideAdvanced") : t("common.showAdvanced")}
                  </Button>
                </div>

                {showAdvanced ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                            <FormLabel>{t("skillForm.projectScope")}</FormLabel>
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
                    </div>
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <FormLabel>{t("skillForm.markdownContent")}</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => insertTemplate(t("skillForm.templateResponsibilities")) }>
                            <ListChecks className="mr-2 h-4 w-4" />
                            {t("skillForm.responsibilities")}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => insertTemplate(t("skillForm.templateOutput")) }>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("skillForm.outputBlock")}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => insertTemplate(t("skillForm.templateExample")) }>
                            <Quote className="mr-2 h-4 w-4" />
                            {t("skillForm.example")}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => insertTemplate("```yaml\nmodel: sonnet-4\ntemperature: 0.2\ncontext: main\n```") }>
                            <Braces className="mr-2 h-4 w-4" />
                            {t("skillForm.yamlSnippet")}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {markdownStats.words} {t("skillForm.words")}
                        </span>
                        <span className="rounded-full border border-border/60 px-2 py-1">{markdownStats.lines} {t("skillForm.lines")}</span>
                        <span className="rounded-full border border-border/60 px-2 py-1">{markdownStats.characters} {t("skillForm.characters")}</span>
                        <span className="ml-auto text-[11px]">{t("skillForm.quickBlocks")}</span>
                      </div>
                      <FormControl>
                        <div data-color-mode="dark" className="skill-editor-shell overflow-hidden rounded-[22px] border border-border/60 bg-card/50 shadow-glow">
                          <LazyMdEditor value={field.value} onChange={(value) => field.onChange(value ?? "")} height={320} />
                        </div>
                      </FormControl>
                      <FormMessage name="content" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("skills.tags")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("skillForm.tagsPlaceholder")} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {showAdvanced ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.model")}</FormLabel>
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
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.temperature")}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.05" min="0" max="1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.context")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">{t("skillForm.contextMain")}</SelectItem>
                            <SelectItem value="fork">{t("skillForm.contextFork")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                    />
                  </div>
                ) : null}

                {showAdvanced ? (
                  <FormField
                  control={form.control}
                  name="tools"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("skillForm.allowedTools")}</FormLabel>
                      <MultiSelect value={field.value} onChange={field.onChange} options={toolOptions.map((tool) => ({ value: tool, label: tool }))} />
                      <FormMessage name="tools" />
                    </FormItem>
                  )}
                  />
                ) : null}

                {showAdvanced ? (
                  <div className="grid gap-4 2xl:grid-cols-2">
                    <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("skillForm.preloadedSkills")}</FormLabel>
                        <MultiSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={allSkills.filter((item) => item.id !== skill?.id).map((item) => ({ value: item.name, label: item.name, description: item.description }))}
                          placeholder={t("skillForm.noPreloadedSkills")}
                        />
                      </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("skillForm.permissions")}</FormLabel>
                        <MultiSelect value={field.value} onChange={field.onChange} options={permissionOptions.map((permission) => ({ value: permission, label: permission }))} />
                      </FormItem>
                    )}
                    />
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="flex min-h-0 max-h-[calc(92vh-88px)] min-w-0 flex-col overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
                <Tabs defaultValue="preview" className="h-full">
                  <TabsList className="h-auto w-full flex-wrap justify-start">
                  <TabsTrigger value="preview">{t("skillForm.livePreview")}</TabsTrigger>
                  {showAdvanced ? <TabsTrigger value="frontmatter">{t("skillForm.frontmatter")}</TabsTrigger> : null}
                  </TabsList>
                <TabsContent value="preview" className="mt-4 h-full overflow-hidden">
                  <ScrollArea className="h-[48vh] min-h-[280px] rounded-2xl border border-border/60 bg-background/50 p-4 lg:h-[56vh]">
                    <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{previewMarkdown}</pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="frontmatter" className="mt-4 h-full overflow-hidden">
                  <ScrollArea className="h-[48vh] min-h-[280px] rounded-2xl border border-border/60 bg-background/50 p-4 lg:h-[56vh]">
                    <div className="space-y-4">
                      <Textarea value={yamlPreview} readOnly className="min-h-[240px] resize-none font-mono text-xs" />
                      <div className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                        {t("skillForm.frontmatterHelp")}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              <div className="mt-4 flex flex-col-reverse justify-end gap-3 border-t border-border/60 pt-4 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("skillForm.save")}</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
