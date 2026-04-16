import { useEffect, useState } from "react";
import { Bot, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function AiAssistantDialog({ open, onOpenChange, kind, onSkillGenerated, onSubagentGenerated }: AiAssistantDialogProps) {
  const { t } = useI18n();
  const aiSettings = useAppStore((state) => state.aiSettings);
  const updateAiSettings = useAppStore((state) => state.updateAiSettings);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const projects = useAppStore((state) => state.projects);
  const skills = useAppStore((state) => state.skills);
  const subagents = useAppStore((state) => state.subagents);

  const [prompt, setPrompt] = useState("");
  const [platforms, setPlatforms] = useState<Platform>("both");
  const [projectId, setProjectId] = useState<string | null>(activeProjectId);
  const [useProjectScope, setUseProjectScope] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setProjectId(activeProjectId);
  }, [activeProjectId]);

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error(t("ai.describeFirst"));
      return;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {kind === "skill" ? <Sparkles className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            {t("ai.title")}
          </DialogTitle>
          <DialogDescription>{kind === "skill" ? t("ai.descriptionSkill") : t("ai.descriptionSubagent")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="brief" className="min-h-0 space-y-4">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="brief">{t("ai.briefTab")}</TabsTrigger>
            <TabsTrigger value="settings">{t("ai.settingsTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="brief" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-border/60 pt-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={generate} disabled={isGenerating}>
            {isGenerating ? t("ai.generating") : kind === "skill" ? t("ai.generateSkill") : t("ai.generateSubagent")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
