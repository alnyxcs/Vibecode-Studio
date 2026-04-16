import { useEffect, useMemo, useState } from "react";
import { Download, FileJson2, FileText, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { buildExportZip, skillToMarkdown, snapshotToJson } from "@/lib/exporters";
import { useI18n } from "@/lib/i18n";
import { importSkillMarkdown, importSubagentMarkdown } from "@/lib/importers";
import { normalizeSnapshot } from "@/lib/snapshot";
import { copyToClipboard, downloadBlob } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { type AppDataSnapshot, type Platform } from "@/types";

interface ExportPageProps {
  snapshot: AppDataSnapshot;
}

export function ExportPage({ snapshot }: ExportPageProps) {
  const { t } = useI18n();
  const [platform, setPlatform] = useState<Platform>("both");
  const [selectedSkillId, setSelectedSkillId] = useState(snapshot.skills[0]?.id ?? "");
  const [markdownImportType, setMarkdownImportType] = useState<"skill" | "subagent">("skill");
  const [rawImport, setRawImport] = useState("");
  const [jsonImport, setJsonImport] = useState("");
  const importSnapshot = useAppStore((state) => state.importSnapshot);
  const upsertSkill = useAppStore((state) => state.upsertSkill);
  const upsertSubagent = useAppStore((state) => state.upsertSubagent);
  const resetToStarter = useAppStore((state) => state.resetToStarter);

  useEffect(() => {
    if (snapshot.skills.length === 0) {
      setSelectedSkillId("");
      return;
    }

    if (!snapshot.skills.some((skill) => skill.id === selectedSkillId)) {
      setSelectedSkillId(snapshot.skills[0].id);
    }
  }, [selectedSkillId, snapshot.skills]);

  const selectedSkill = useMemo(() => snapshot.skills.find((skill) => skill.id === selectedSkillId) ?? null, [selectedSkillId, snapshot.skills]);
  const sampleSkillMarkdown = useMemo(() => (selectedSkill ? skillToMarkdown(selectedSkill) : ""), [selectedSkill]);

  const parseSnapshotImport = (value: string): AppDataSnapshot | null => {
    try {
      const parsed = JSON.parse(value) as Partial<AppDataSnapshot>;

      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.skills) || !Array.isArray(parsed.subagents)) {
        toast.error(t("toast.invalidSnapshot"));
        return null;
      }

      return normalizeSnapshot(parsed as AppDataSnapshot);
    } catch {
      toast.error(t("toast.invalidJson"));
      return null;
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={t("export.eyebrow")}
        title={t("export.title")}
        description={t("export.description")}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("export.packages")}</CardTitle>
            <CardDescription>{t("export.packagesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
              <SelectTrigger>
                <SelectValue placeholder={t("export.selectTarget")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">{t("export.both")}</SelectItem>
                <SelectItem value="opencode">{t("platform.opencode")}</SelectItem>
                <SelectItem value="claude">{t("platform.claude")}</SelectItem>
              </SelectContent>
            </Select>

            {snapshot.skills.length > 0 ? (
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("export.selectSkill")} />
                </SelectTrigger>
                <SelectContent>
                  {snapshot.skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">{t("export.noSkills")}</div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                className="h-auto whitespace-normal px-3 py-2 text-center leading-tight"
                onClick={async () => {
                  const blob = await buildExportZip(platform, snapshot);
                  downloadBlob(blob, `vibecode-studio-${platform}.zip`);
                  toast.success(t("toast.zipCreated"));
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("export.downloadZip")}
              </Button>
              <Button
                className="h-auto whitespace-normal px-3 py-2 text-center leading-tight"
                variant="outline"
                onClick={async () => {
                  await copyToClipboard(snapshotToJson(snapshot));
                  toast.success(t("toast.jsonCopied"));
                }}
              >
                <FileJson2 className="mr-2 h-4 w-4" />
                {t("export.copyJson")}
              </Button>
              <Button
                className="h-auto whitespace-normal px-3 py-2 text-center leading-tight"
                variant="outline"
                disabled={!sampleSkillMarkdown}
                onClick={async () => {
                  await copyToClipboard(sampleSkillMarkdown);
                  toast.success(t("toast.skillCopied"));
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("export.copySkill")}
              </Button>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
              {t("export.paths")}
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{t("export.helpTitle")}</div>
              <p className="mt-2">{t("export.helpBody")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40">
          <CardHeader>
            <CardTitle>{t("export.importAssets")}</CardTitle>
            <CardDescription>{t("export.importAssetsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="markdown">
              <TabsList>
                <TabsTrigger value="markdown">{t("common.markdown")}</TabsTrigger>
                <TabsTrigger value="json">{t("common.json")}</TabsTrigger>
              </TabsList>
              <TabsContent value="markdown" className="space-y-4 pt-4">
                <Select value={markdownImportType} onValueChange={(value) => setMarkdownImportType(value as "skill" | "subagent") }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">{t("export.importSkillType")}</SelectItem>
                    <SelectItem value="subagent">{t("export.importSubagentType")}</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea className="min-h-[280px] font-mono text-xs" value={rawImport} onChange={(event) => setRawImport(event.target.value)} placeholder={t("export.pasteMarkdown")} />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      const markdown = rawImport.trim();
                      if (!markdown) return;

                      if (markdownImportType === "subagent") {
                        upsertSubagent(importSubagentMarkdown(markdown));
                        toast.success(t("toast.subagentImported"));
                      } else {
                        upsertSkill(importSkillMarkdown(markdown));
                        toast.success(t("toast.skillImported"));
                      }
                      setRawImport("");
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("export.importMarkdown")}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="json" className="space-y-4 pt-4">
                <Textarea className="min-h-[280px] font-mono text-xs" value={jsonImport} onChange={(event) => setJsonImport(event.target.value)} placeholder={t("export.pasteJson")} />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      const parsed = parseSnapshotImport(jsonImport);
                      if (!parsed) return;
                      importSnapshot(parsed, "merge");
                      setJsonImport("");
                      toast.success(t("toast.snapshotMerged"));
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("export.merge")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const parsed = parseSnapshotImport(jsonImport);
                      if (!parsed) return;
                      importSnapshot(parsed, "replace");
                      setJsonImport("");
                      toast.success(t("toast.snapshotReplaced"));
                    }}
                  >
                    {t("export.replace")}
                  </Button>
                  <Button variant="ghost" onClick={resetToStarter}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {t("export.reset")}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
