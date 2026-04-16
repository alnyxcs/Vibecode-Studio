import { projectGradients } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { type AppDataSnapshot, type Platform, type Project, type Skill, type Subagent } from "@/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asStringArray(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]/) : [];
  return Array.from(new Set(source.map((item) => String(item).trim()).filter(Boolean)));
}

function asDate(value: unknown) {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function asPlatform(value: unknown): Platform {
  return value === "opencode" || value === "claude" || value === "both" ? value : "both";
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function wouldCreateSubagentCycle(subagents: Array<Pick<Subagent, "id" | "parentId">>, nodeId: string, parentId: string | null) {
  if (!parentId || parentId === nodeId) {
    return parentId === nodeId;
  }

  const byId = new Map(subagents.map((subagent) => [subagent.id, subagent]));
  const seen = new Set<string>([nodeId]);
  let currentId: string | null = parentId;

  while (currentId) {
    if (seen.has(currentId)) {
      return true;
    }

    seen.add(currentId);
    currentId = byId.get(currentId)?.parentId ?? null;
  }

  return false;
}

function normalizeProjects(rawProjects: unknown[]) {
  const projects = rawProjects.map((value, index): Project => {
    const project = asRecord(value);
    return {
      id: asText(project.id, createId("project")),
      name: asText(project.name, `Imported Project ${index + 1}`),
      description: asText(project.description, "Imported project"),
      color: asText(project.color, projectGradients[0]),
      createdAt: asDate(project.createdAt),
    };
  });

  return uniqueById(projects);
}

function normalizeSkills(rawSkills: unknown[], projectIds: Set<string>) {
  const skills = rawSkills.map((value, index): Skill => {
    const skill = asRecord(value);
    const frontmatter = asRecord(skill.frontmatter);
    const visibility = skill.visibility === "project" ? "project" : "global";
    const projectId = typeof skill.projectId === "string" && projectIds.has(skill.projectId) ? skill.projectId : null;

    return {
      id: asText(skill.id, createId("skill")),
      name: asText(skill.name, `Imported Skill ${index + 1}`),
      description: asText(skill.description, "Imported from JSON"),
      content: typeof skill.content === "string" ? skill.content.trim() : "",
      tags: asStringArray(skill.tags),
      visibility: visibility === "project" && projectId ? "project" : "global",
      projectId: visibility === "project" && projectId ? projectId : null,
      platforms: asPlatform(skill.platforms),
      updatedAt: asDate(skill.updatedAt),
      frontmatter: {
        model: asText(frontmatter.model, "sonnet-4"),
        temperature: (() => {
          const raw = Number(frontmatter.temperature);
          return Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0.2;
        })(),
        context: frontmatter.context === "fork" ? "fork" : "main",
        tools: asStringArray(frontmatter.tools),
        skills: asStringArray(frontmatter.skills),
        permissions: asStringArray(frontmatter.permissions),
      },
    };
  });

  return uniqueById(skills);
}

function normalizeSubagents(rawSubagents: unknown[], projectIds: Set<string>, skillIds: Set<string>) {
  const subagents = rawSubagents.map((value, index): Subagent => {
    const subagent = asRecord(value);
    const visibility = subagent.visibility === "project" ? "project" : "global";
    const projectId = typeof subagent.projectId === "string" && projectIds.has(subagent.projectId) ? subagent.projectId : null;

    return {
      id: asText(subagent.id, createId("agent")),
      name: asText(subagent.name, `imported-agent-${index + 1}`),
      rolePrompt: typeof subagent.rolePrompt === "string" ? subagent.rolePrompt.trim() : "",
      description: asText(subagent.description, "Imported from JSON"),
      preferredModel: asText(subagent.preferredModel, "sonnet-4"),
      preloadedSkillIds: asStringArray(subagent.preloadedSkillIds).filter((id) => skillIds.has(id)),
      allowedTools: asStringArray(subagent.allowedTools),
      contextBehavior: subagent.contextBehavior === "share" ? "share" : "separate",
      parentId: typeof subagent.parentId === "string" && subagent.parentId.trim().length > 0 ? subagent.parentId : null,
      usageExamples: asStringArray(subagent.usageExamples),
      visibility: visibility === "project" && projectId ? "project" : "global",
      projectId: visibility === "project" && projectId ? projectId : null,
      platforms: asPlatform(subagent.platforms),
      updatedAt: asDate(subagent.updatedAt),
    };
  });

  return uniqueById(subagents);
}

function normalizeParentLinks(subagents: Subagent[]) {
  const byId = new Map(subagents.map((subagent) => [subagent.id, subagent]));

  return subagents.map((subagent) => {
    const parentId = subagent.parentId;
    if (!parentId || !byId.has(parentId) || wouldCreateSubagentCycle(subagents, subagent.id, parentId)) {
      return { ...subagent, parentId: null };
    }

    return subagent;
  });
}

export function normalizeSnapshot(snapshot: AppDataSnapshot) {
  const rawProjects = Array.isArray(snapshot.projects) ? snapshot.projects : [];
  const projects = normalizeProjects(rawProjects);
  const projectIds = new Set(projects.map((project) => project.id));

  const rawSkills = Array.isArray(snapshot.skills) ? snapshot.skills : [];
  const skills = normalizeSkills(rawSkills, projectIds);
  const skillIds = new Set(skills.map((skill) => skill.id));

  const rawSubagents = Array.isArray(snapshot.subagents) ? snapshot.subagents : [];
  const subagents = normalizeParentLinks(normalizeSubagents(rawSubagents, projectIds, skillIds));

  return { projects, skills, subagents };
}
