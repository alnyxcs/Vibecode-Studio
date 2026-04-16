import { useEffect, useMemo, useState } from "react";
import { Download, FileJson2, FileText, FolderOpen, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { buildExportZip, skillToMarkdown, snapshotToJson } from "@/lib/exporters";
import { useI18n } from "@/lib/i18n";
import { importDiscoveredAsset, importSkillMarkdown, importSubagentMarkdown, scanFolderForAssets, type DiscoveredAsset } from "@/lib/importers";
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
  const [discoveredAssets, setDiscoveredAssets] = useState<DiscoveredAsset[]>([]);
  const [isScanning, setIsScanning] = useState(false);
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

  const handleFolderScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    try {
      const assets = await scanFolderForAssets(Array.from(files));
      setDiscoveredAssets(assets);
      if (assets.length === 0) {
        toast.info(t("export.noAssetsFound"));
      } else {
        toast.success(t("export.foundAssets").replace("{count}", String(assets.length)));
      }
    } catch (error) {
      toast.error(t("export.scanError"));
    } finally {
      setIsScanning(false);
      event.target.value = "";
    }
  };

  const handleImportDiscovered = () => {
    let skillsCount = 0;
    let agentsCount = 0;

    for (const asset of discoveredAssets) {
      const imported = importDiscoveredAsset(asset);
      if (imported && "rolePrompt" in imported) {
        upsertSubagent(imported);
        agentsCount++;
      } else if (imported) {
        upsertSkill(imported);
        skillsCount++;
      }
    }

    toast.success(t("export.importedAssets").replace("{skills}", String(skillsCount)).replace("{agents}", String(agentsCount)));
    setDiscoveredAssets([]);
  };

  const handleImportSelected = (asset: DiscoveredAsset) => {
    const imported = importDiscoveredAsset(asset);
    if (imported && "rolePrompt" in imported) {
      upsertSubagent(imported);
      toast.success(t("toast.subagentImported"));
    } else if (imported) {
      upsertSkill(imported);
      toast.success(t("toast.skillImported"));
    }
    setDiscoveredAssets((prev) => prev.filter((a) => a.path !== asset.path));
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
            <Tabs defaultValue="folder">
              <TabsList>
                <TabsTrigger value="folder">{t("export.folderTab")}</TabsTrigger>
                <TabsTrigger value="markdown">{t("common.markdown")}</TabsTrigger>
                <TabsTrigger value="json">{t("common.json")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="folder" className="space-y-4 pt-4">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-center">
                      <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t("export.folderHint")}</p>
                    </div>
                    <input
                      type="file"
                      id="folder-upload"
                      // @ts-expect-error - webkitdirectory is a non-standard but widely supported attribute
                      webkitdirectory=""
                      multiple
                      className="hidden"
                      onChange={handleFolderScan}
                    />
                    <label htmlFor="folder-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <FolderOpen className="mr-2 h-4 w-4" />
                          {isScanning ? t("export.scanning") : t("export.selectFolder")}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {discoveredAssets.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {t("export.discoveredAssets").replace("{count}", String(discoveredAssets.length))}
                      </p>
                      <Button size="sm" onClick={handleImportDiscovered}>
                        <Upload className="mr-1 h-3 w-3" />
                        {t("export.importAll")}
                      </Button>
                    </div>
                    <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-background/30 p-3">
                      {discoveredAssets.map((asset) => (
                        <div
                          key={asset.path}
                          className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{asset.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{asset.path}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                              {asset.platform}
                            </span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                              {asset.type}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => handleImportSelected(asset)}>
                              <Upload className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

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
