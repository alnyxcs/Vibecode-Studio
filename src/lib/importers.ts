import YAML from "yaml";
import { type Skill, type Subagent } from "@/types";
import { createId } from "@/lib/utils";

function arrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseMarkdownFrontmatter(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {} as Record<string, unknown>,
      content: normalized.trim(),
    };
  }

  try {
    return {
      data: (YAML.parse(match[1]) as Record<string, unknown> | null) ?? {},
      content: match[2].trim(),
    };
  } catch {
    return {
      data: {} as Record<string, unknown>,
      content: normalized.trim(),
    };
  }
}

export function importSkillMarkdown(markdown: string): Skill {
  const parsed = parseMarkdownFrontmatter(markdown);
  const data = parsed.data;

  return {
    id: createId("skill"),
    name: String(data.name ?? "Imported Skill"),
    description: String(data.description ?? "Imported from markdown"),
    content: parsed.content.trim(),
    tags: arrayValue(data.tags),
    visibility: data.visibility === "project" ? "project" : "global",
    projectId: typeof data.projectId === "string" ? data.projectId : null,
    platforms: data.platforms === "opencode" || data.platforms === "claude" ? data.platforms : "both",
    updatedAt: new Date().toISOString(),
    frontmatter: {
      model: String(data.model ?? "sonnet-4"),
      temperature: Number(data.temperature ?? 0.2),
      context: data.context === "fork" ? "fork" : "main",
      tools: arrayValue(data.tools),
      skills: arrayValue(data.skills),
      permissions: arrayValue(data.permissions),
    },
  };
}

export function importSubagentMarkdown(markdown: string): Subagent {
  const parsed = parseMarkdownFrontmatter(markdown);
  const data = parsed.data;

  const preloadedSkillIds = arrayValue(data.preloadedSkillIds);

  return {
    id: createId("agent"),
    name: String(data.name ?? "imported-agent"),
    description: String(data.description ?? "Imported from markdown"),
    rolePrompt: parsed.content.trim(),
    preferredModel: String(data.preferredModel ?? "sonnet-4"),
    preloadedSkillIds,
    allowedTools: arrayValue(data.allowedTools),
    contextBehavior: data.contextBehavior === "share" ? "share" : "separate",
    parentId: typeof data.parentId === "string" ? data.parentId : null,
    usageExamples: arrayValue(data.usageExamples),
    visibility: data.visibility === "project" ? "project" : "global",
    projectId: typeof data.projectId === "string" ? data.projectId : null,
    platforms: data.platforms === "opencode" || data.platforms === "claude" ? data.platforms : "both",
    updatedAt: new Date().toISOString(),
  };
}
