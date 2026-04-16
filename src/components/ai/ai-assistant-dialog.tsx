import { useEffect, useState } from "react";
import { Bot, Copy, Sparkles, Wand2, ArrowRight, Settings2, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { applyProviderPreset, generateSkillDraft, generateSubagentDraft } from "@/lib/ai-generator";
import { aiProviderLabels } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/store/use-app-store";
import { type GeneratedSkillDraft, type GeneratedSubagentDraft, type Platform } from "@/types";

interface AiAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: "skill" | "subagent";
  onSkillGenerated?: (draft: GeneratedSkillDraft) => void;
  onSubagentGenerated?: (draft: GeneratedSubagentDraft) => void;
}

type Step = "settings" | "prompt";

export function AiAssistantDialog({ open, onOpenChange, kind, onSkillGenerated, onSubagentGenerated }: AiAssistantDialogProps) {
  const { t } = useI18n();
  const aiSettings = useAppStore((state) => state.aiSettings);
  const updateAiSettings = useAppStore((state) => state.updateAiSettings);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const projects = useAppStore((state) => state.projects);
  const skills = useAppStore((state) => state.skills);
  const subagents = useAppStore((state) => state.subagents);

  const [step, setStep] = useState<Step>("settings");
  const [prompt, setPrompt] = useState("");
  const [platforms, setPlatforms] = useState<Platform>("both");
  const [projectId, setProjectId] = useState<string | null>(activeProjectId);
  const [useProjectScope, setUseProjectScope] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptTemplate, setShowPromptTemplate] = useState(false);
  const [showExternalAiDialog, setShowExternalAiDialog] = useState(false);

  useEffect(() => {
    setProjectId(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (open) {
      setStep("settings");
      setPrompt("");
      setShowPromptTemplate(false);
      setShowExternalAiDialog(false);
    }
  }, [open]);

  const getPromptTemplate = () => {
    const userPrompt = prompt.trim() || "[INSERT YOUR REQUEST HERE]";
    
    if (kind === "skill") {
      return `You are a prompt engineering expert for AI coding assistants like OpenCode and Claude Code.

Generate a production-ready SKILL in JSON format with the following structure:

{
  "name": "Skill Name (title case, 1-3 words)",
  "description": "Brief description of what this skill does (50-100 chars)",
  "content": "Full markdown instruction with:
    - Role definition (who this skill is)
    - Responsibilities (what it does)
    - Workflow (step-by-step process)
    - Output format (what it returns)",
  "frontmatter": {
    "model": "recommended model (e.g., sonnet-4, gpt-4.1)",
    "temperature": 0.3,
    "context": "fork" or "main",
    "tools": ["tool1", "tool2"],
    "skills": ["other skill names to preload"],
    "permissions": ["permission1", "permission2"]
  },
  "tags": ["tag1", "tag2", "tag3"],
  "visibility": "global" or "project",
  "platforms": "opencode" or "claude" or "both"
}

User request: ${userPrompt}

Generate only valid JSON, no additional text.`;
    }

    return `You are a prompt engineering expert for AI coding assistants like OpenCode and Claude Code.

Generate a production-ready SUBAGENT in JSON format with the following structure:

{
  "name": "Agent Name (lowercase, hyphens allowed)",
  "description": "Brief description (50-100 chars)",
  "rolePrompt": "Full system prompt with:
    - Role definition and expertise
    - Primary mission
    - Operating rules and behavior
    - When to ask clarifying questions",
  "preferredModel": "recommended model",
  "preloadedSkillIds": ["skill ids to preload"],
  "allowedTools": ["Read", "Glob", "Grep", "Edit", "Bash", "WebFetch"],
  "contextBehavior": "separate" or "share",
  "parentId": null,
  "usageExamples": ["@agent-name example usage 1", "@agent-name example usage 2"],
  "visibility": "global" or "project",
  "platforms": "opencode" or "claude" or "both"
}

User request: ${userPrompt}

Generate only valid JSON, no additional text.`;
  };

  const copyPromptTemplate = async () => {
    const template = getPromptTemplate();
    await navigator.clipboard.writeText(template);
    toast.success(t("common.copied"));
  };

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error(t("ai.describeFirst"));
      return;
    }

    if (aiSettings.mode !== "local" && !aiSettings.apiKey) {
      toast.warning(t("ai.noApiKeyFallback"));
    }

    setIsGenerating(true);
    try {
      if (kind === "skill") {
        const draft = await generateSkillDraft(aiSettings, {
          prompt,
          platforms,
          projectId: useProjectScope ? projectId : null,
          projects,
          skills,
        });
        onSkillGenerated?.(draft);
      } else {
        const draft = await generateSubagentDraft(aiSettings, {
          prompt,
          platforms,
          projectId: useProjectScope ? projectId : null,
          skills,
          subagents,
        });
        onSubagentGenerated?.(draft);
      }

      toast.success(kind === "skill" ? t("ai.skillGenerated") : t("ai.subagentGenerated"));
      onOpenChange(false);
      setPrompt("");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("ai.generateFailed");
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {kind === "skill" ? <Sparkles className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              {t("ai.title")}
            </DialogTitle>
            <DialogDescription>
              {step === "settings" ? t("ai.settingsDescription") : kind === "skill" ? t("ai.descriptionSkill") : t("ai.descriptionSubagent")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            {step === "settings" ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 to-primary/10 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  {t("ai.quickStart")}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>{t("ai.settingsHelp")}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("ai.mode")}</Label>
                  <Select value={aiSettings.mode} onValueChange={(value) => updateAiSettings({ mode: value as typeof aiSettings.mode })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">{t("ai.modeHybrid")}</SelectItem>
                      <SelectItem value="api">{t("ai.modeApi")}</SelectItem>
                      <SelectItem value="local">{t("ai.modeLocal")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("ai.provider")}</Label>
                  <Select
                    value={aiSettings.provider}
                    onValueChange={(value) => {
                      const provider = value as typeof aiSettings.provider;
                      const preset = applyProviderPreset(provider);
                      updateAiSettings({ provider, baseUrl: preset.baseUrl, model: preset.model });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(aiProviderLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("common.temperature")}</Label>
                  <Input type="number" min="0" max="1" step="0.05" value={aiSettings.temperature} onChange={(event) => updateAiSettings({ temperature: Number(event.target.value) })} />
                </div>
              </div>

              {aiSettings.provider === "custom" && (
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{t("ai.customHintTitle")}</div>
                  <p className="mt-2">{t("ai.customHintBody")}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("ai.baseUrl")}</Label>
                  <Input value={aiSettings.baseUrl} onChange={(event) => updateAiSettings({ baseUrl: event.target.value })} placeholder={aiSettings.provider === "custom" ? "https://your-api.example.com/v1" : "https://api.openai.com/v1"} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.model")}</Label>
                  <Input value={aiSettings.model} onChange={(event) => updateAiSettings({ model: event.target.value })} placeholder={aiSettings.provider === "custom" ? "your-model-name" : "gpt-4.1"} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("ai.apiKey")}</Label>
                <Input type="password" value={aiSettings.apiKey} onChange={(event) => updateAiSettings({ apiKey: event.target.value })} placeholder={t("ai.apiKeyPlaceholder")} />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowExternalAiDialog(true)}
                >
                  {t("ai.noApiKey")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("ai.generationBrief")}</Label>
                    <Textarea
                      className="min-h-[240px]"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder={kind === "skill" ? t("ai.skillPlaceholder") : t("ai.subagentPlaceholder")}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("common.platforms")}</Label>
                      <Select value={platforms} onValueChange={(value) => setPlatforms(value as Platform)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">{t("common.both")}</SelectItem>
                          <SelectItem value="opencode">{t("platform.opencode")}</SelectItem>
                          <SelectItem value="claude">{t("platform.claude")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("ai.useProjectScope")}</Label>
                      <div className="flex h-10 items-center rounded-xl border border-input bg-background/70 px-3">
                        <Switch checked={useProjectScope} onCheckedChange={setUseProjectScope} />
                        <span className="ml-3 text-sm text-muted-foreground">{useProjectScope ? t("ai.projectSpecific") : t("ai.globalDraft")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.project")}</Label>
                    <Select value={projectId ?? projects[0]?.id} onValueChange={(value) => setProjectId(value)}>
                      <SelectTrigger disabled={!useProjectScope}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Wand2 className="h-4 w-4" />
                    {t("ai.howItWorks")}
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <p>{t("ai.hybridHelp")}</p>
                    <p>{t("ai.apiHelp")}</p>
                    <p>{t("ai.localHelp")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Settings2 className="h-4 w-4" />
                      {t("ai.useExternalAi")}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("ai.useExternalAiHint")}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPromptTemplate(!showPromptTemplate)}>
                    {showPromptTemplate ? t("ai.hideTemplate") : t("ai.showTemplate")}
                  </Button>
                </div>

                {showPromptTemplate && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">{t("ai.templateDescription")}</p>
                    <div className="relative">
                      <Textarea
                        className="min-h-[200px] font-mono text-xs"
                        value={getPromptTemplate()}
                        readOnly
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute right-2 top-2"
                        onClick={copyPromptTemplate}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        {t("common.copy")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("ai.templateHint")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-border/60 pt-4 sm:flex-row shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            {step === "settings" ? (
              <Button type="button" onClick={() => setStep("prompt")}>
                {t("ai.nextStep")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep("settings")} variant="outline">
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                {t("ai.backToSettings")}
              </Button>
            )}
            {step === "prompt" && (
              <Button type="button" onClick={generate} disabled={isGenerating}>
                {isGenerating ? t("ai.generating") : kind === "skill" ? t("ai.generateSkill") : t("ai.generateSubagent")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExternalAiDialog} onOpenChange={setShowExternalAiDialog}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("ai.externalAiTitle")}
            </DialogTitle>
            <DialogDescription>{t("ai.externalAiDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            <div className="space-y-2">
              <Label>{t("ai.yourRequest")}</Label>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={kind === "skill" ? t("ai.skillPlaceholder") : t("ai.subagentPlaceholder")}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">{t("ai.yourRequestHint")}</p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Copy className="h-4 w-4" />
                {t("ai.promptForAi")}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t("ai.promptForAiHint")}</p>
              
              <div className="mt-4 relative">
                <Textarea
                  className="min-h-[250px] font-mono text-xs"
                  value={getPromptTemplate()}
                  readOnly
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={copyPromptTemplate}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {t("common.copy")}
                </Button>
              </div>
              
              <p className="mt-3 text-xs text-muted-foreground">{t("ai.templateHint")}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{t("ai.externalAiSteps")}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border/60 pt-4 shrink-0">
            <Button type="button" variant="outline" onClick={() => setShowExternalAiDialog(false)}>
              {t("common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}