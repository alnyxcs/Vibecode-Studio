import { invoke } from "@tauri-apps/api/core";
import type { ThemeMode, Locale, AppView, AiSettings, Project } from "@/types";

export interface TauriAppSettings {
  theme: ThemeMode;
  locale: Locale;
  active_view: AppView;
  active_project_id: string;
  ai_settings: {
    mode: string;
    provider: string;
    base_url: string;
    model: string;
    temperature: number;
    api_key: string;
  };
  projects: {
    id: string;
    name: string;
    description: string;
    color: string;
    created_at: string;
  }[];
}

export interface TauriSkill {
  id: string;
  name: string;
  description: string;
  content: string;
  frontmatter: {
    model: string;
    temperature: number;
    context: string;
    tools: string[];
    skills: string[];
    permissions: string[];
  };
  tags: string[];
  visibility: string;
  project_id: string | null;
  platforms: string[];
  updated_at: string;
  preferred_model: string | null;
  usage_examples: string[];
}

export interface TauriSubagent {
  id: string;
  name: string;
  role_prompt: string;
  description: string;
  preferred_model: string | null;
  parent_id: string | null;
  allowed_tools: string[];
  preloaded_skill_ids: string[];
  usage_examples: string[];
  visibility: string;
  project_id: string | null;
  platforms: string[];
  context_behavior: string;
  updated_at: string;
}

export async function saveSettings(data: TauriAppSettings): Promise<void> {
  await invoke("save_settings", { data });
}

export async function loadSettings(): Promise<TauriAppSettings | null> {
  return await invoke("load_settings");
}

export async function saveSkill(skill: TauriSkill): Promise<void> {
  await invoke("save_skill", { skill });
}

export async function deleteSkill(skillId: string): Promise<void> {
  await invoke("delete_skill", { skillId });
}

export async function loadSkills(): Promise<TauriSkill[]> {
  return await invoke("load_skills");
}

export async function saveSubagent(subagent: TauriSubagent): Promise<void> {
  await invoke("save_subagent", { subagent });
}

export async function deleteSubagent(subagentId: string): Promise<void> {
  await invoke("delete_subagent", { subagentId });
}

export async function loadSubagents(): Promise<TauriSubagent[]> {
  return await invoke("load_subagents");
}