import JSZip from "jszip";
import YAML from "yaml";
import { type AppDataSnapshot, type Platform, type Skill, type Subagent } from "@/types";
import { slugify } from "@/lib/utils";

function matchesPlatform(target: Exclude<Platform, "both">, assetPlatform: Platform) {
  return assetPlatform === "both" || assetPlatform === target;
}

function exportName(name: string, fallbackId: string) {
  const slug = slugify(name);
  return slug === "untitled" ? fallbackId : slug;
}

function yamlBlock(data: Record<string, unknown>) {
  return `---\n${YAML.stringify(data).trimEnd()}\n---`;
}

export function skillToMarkdown(skill: Skill) {
  const frontmatter = yamlBlock({
    name: skill.name,
    description: skill.description,
    platforms: skill.platforms,
    tags: skill.tags,
    model: skill.frontmatter.model,
    temperature: skill.frontmatter.temperature,
    context: skill.frontmatter.context,
    tools: skill.frontmatter.tools,
    skills: skill.frontmatter.skills,
    permissions: skill.frontmatter.permissions,
  });

  return `${frontmatter}\n\n${skill.content.trim()}\n`;
}

export function subagentToMarkdown(subagent: Subagent, skills: Skill[]) {
  const preloadedSkills = skills.filter((skill) => subagent.preloadedSkillIds.includes(skill.id)).map((skill) => skill.name);
  const frontmatter = yamlBlock({
    name: subagent.name,
    description: subagent.description,
    platforms: subagent.platforms,
    preferredModel: subagent.preferredModel,
    preloadedSkillIds: subagent.preloadedSkillIds,
    preloadedSkills,
    allowedTools: subagent.allowedTools,
    contextBehavior: subagent.contextBehavior,
    usageExamples: subagent.usageExamples,
  });

  return `${frontmatter}\n\n${subagent.rolePrompt.trim()}\n`;
}

function addPlatformFiles(zip: JSZip, root: string, target: Exclude<Platform, "both">, data: AppDataSnapshot) {
  const targetSkills = data.skills.filter((item) => matchesPlatform(target, item.platforms));

  for (const skill of targetSkills) {
    zip.file(`${root}/skills/${exportName(skill.name, skill.id)}/SKILL.md`, skillToMarkdown(skill));
  }

  for (const subagent of data.subagents.filter((item) => matchesPlatform(target, item.platforms))) {
    zip.file(`${root}/agents/${exportName(subagent.name, subagent.id)}.md`, subagentToMarkdown(subagent, targetSkills));
  }
}

export async function buildExportZip(platform: Platform, data: AppDataSnapshot) {
  const zip = new JSZip();

  if (platform === "opencode" || platform === "both") {
    addPlatformFiles(zip, ".opencode", "opencode", data);
  }

  if (platform === "claude" || platform === "both") {
    addPlatformFiles(zip, ".claude", "claude", data);
  }

  return zip.generateAsync({ type: "blob" });
}

export function snapshotToJson(data: AppDataSnapshot) {
  return JSON.stringify(data, null, 2);
}
