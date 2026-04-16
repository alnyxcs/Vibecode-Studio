export type Platform = "opencode" | "claude" | "both";
export type Visibility = "global" | "project";
export type AppView = "home" | "dashboard" | "skills" | "subagents" | "projects" | "export" | "docs";
export type ContextMode = "fork" | "main";
export type ContextBehavior = "separate" | "share";
export type ThemeMode = "dark" | "light";
export type Locale = "en" | "ru";
export type AiProvider =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "gemini"
  | "groq"
  | "deepseek"
  | "mistral"
  | "xai"
  | "together"
  | "fireworks"
  | "perplexity"
  | "ollama"
  | "cerebras"
  | "sambanova"
  | "hyperbolic"
  | "moonshot"
  | "nebius"
  | "custom";
export type AiGenerationMode = "hybrid" | "api" | "local";

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface SkillFrontmatter {
  model: string;
  temperature: number;
  context: ContextMode;
  tools: string[];
  skills: string[];
  permissions: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  frontmatter: SkillFrontmatter;
  tags: string[];
  visibility: Visibility;
  projectId: string | null;
  platforms: Platform;
  updatedAt: string;
}

export interface Subagent {
  id: string;
  name: string;
  rolePrompt: string;
  description: string;
  preferredModel: string;
  preloadedSkillIds: string[];
  allowedTools: string[];
  contextBehavior: ContextBehavior;
  parentId: string | null;
  usageExamples: string[];
  visibility: Visibility;
  projectId: string | null;
  platforms: Platform;
  updatedAt: string;
}

export interface AppDataSnapshot {
  projects: Project[];
  skills: Skill[];
  subagents: Subagent[];
}

export interface AiSettings {
  mode: AiGenerationMode;
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
}

export interface GeneratedSkillDraft {
  name: string;
  description: string;
  content: string;
  frontmatter: SkillFrontmatter;
  tags: string[];
  visibility: Visibility;
  projectId: string | null;
  platforms: Platform;
}

export interface GeneratedSubagentDraft {
  name: string;
  rolePrompt: string;
  description: string;
  preferredModel: string;
  preloadedSkillIds: string[];
  allowedTools: string[];
  contextBehavior: ContextBehavior;
  parentId: string | null;
  usageExamples: string[];
  visibility: Visibility;
  projectId: string | null;
  platforms: Platform;
}
