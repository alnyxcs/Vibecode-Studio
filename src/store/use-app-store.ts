import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getStarterSnapshot, localizeStarterData } from "@/data/starter";
import { aiProviderDefaults } from "@/lib/constants";
import { normalizeSnapshot, wouldCreateSubagentCycle } from "@/lib/snapshot";
import { type AppDataSnapshot, type AppView, type Locale, type Project, type Skill, type Subagent, type ThemeMode, type AiSettings } from "@/types";
import { createId } from "@/lib/utils";
import { saveSettings, loadSettings, saveSkill, deleteSkill, loadSkills, saveSubagent, deleteSubagent, loadSubagents, type TauriAppSettings, type TauriSkill, type TauriSubagent } from "@/lib/tauri-data";

const initialLocale: Locale = "en";
const initialSnapshot = getStarterSnapshot(initialLocale);

function toPersistedState(settings: TauriAppSettings, skills: TauriSkill[], subagents: TauriSubagent[]) {
  return {
    theme: settings.theme,
    locale: settings.locale,
    activeView: settings.active_view,
    activeProjectId: settings.active_project_id,
    aiSettings: {
      mode: settings.ai_settings.mode as AiSettings["mode"],
      provider: settings.ai_settings.provider as AiSettings["provider"],
      baseUrl: settings.ai_settings.base_url,
      model: settings.ai_settings.model,
      temperature: settings.ai_settings.temperature,
      apiKey: settings.ai_settings.api_key,
    },
    projects: settings.projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: p.created_at,
    })),
    skills: skills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      content: s.content,
      frontmatter: {
        model: s.frontmatter.model,
        temperature: s.frontmatter.temperature,
        context: s.frontmatter.context as Skill["frontmatter"]["context"],
        tools: s.frontmatter.tools,
        skills: s.frontmatter.skills,
        permissions: s.frontmatter.permissions,
      },
      tags: s.tags,
      visibility: s.visibility as Skill["visibility"],
      projectId: s.project_id,
      platforms: s.platforms as unknown as Skill["platforms"],
      updatedAt: s.updated_at,
    })),
    subagents: subagents.map(sa => ({
      id: sa.id,
      name: sa.name,
      rolePrompt: sa.role_prompt,
      description: sa.description,
      preferredModel: sa.preferred_model || "",
      preloadedSkillIds: sa.preloaded_skill_ids,
      allowedTools: sa.allowed_tools,
      contextBehavior: sa.context_behavior as Subagent["contextBehavior"],
      parentId: sa.parent_id,
      usageExamples: sa.usage_examples,
      visibility: sa.visibility as Subagent["visibility"],
      projectId: sa.project_id,
      platforms: sa.platforms as unknown as Subagent["platforms"],
      updatedAt: sa.updated_at,
    })),
  };
}

interface AppState extends AppDataSnapshot {
  theme: ThemeMode;
  locale: Locale;
  activeView: AppView;
  activeProjectId: string;
  aiSettings: AiSettings;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setActiveView: (view: AppView) => void;
  setActiveProjectId: (projectId: string) => void;
  updateAiSettings: (settings: Partial<AiSettings>) => void;
  upsertProject: (project: Omit<Project, "id" | "createdAt"> & { id?: string }) => void;
  deleteProject: (projectId: string) => void;
  upsertSkill: (skill: Skill) => void;
  deleteSkill: (skillId: string) => void;
  upsertSubagent: (subagent: Subagent) => void;
  deleteSubagent: (subagentId: string) => void;
  importSnapshot: (snapshot: AppDataSnapshot, mode: "merge" | "replace") => void;
  resetToStarter: () => void;
}

type PersistedAppState = Pick<AppState, "theme" | "locale" | "activeView" | "activeProjectId" | "aiSettings" | "projects" | "skills" | "subagents">;

const tauriStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    try {
      const settings = await loadSettings();
      const skills = await loadSkills();
      const subagents = await loadSubagents();
      if (!settings) return null;
      return JSON.stringify(toPersistedState(settings, skills, subagents));
    } catch {
      return null;
    }
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      const parsed = JSON.parse(value) as PersistedAppState;
      
      const settings: TauriAppSettings = {
        theme: parsed.theme || "dark",
        locale: parsed.locale || "en",
        active_view: parsed.activeView || "home",
        active_project_id: parsed.activeProjectId || "",
        ai_settings: parsed.aiSettings ? {
          mode: parsed.aiSettings.mode || "hybrid",
          provider: parsed.aiSettings.provider || "openai",
          base_url: parsed.aiSettings.baseUrl || "",
          model: parsed.aiSettings.model || "",
          temperature: parsed.aiSettings.temperature ?? 0.3,
          api_key: parsed.aiSettings.apiKey || "",
        } : {
          mode: "hybrid",
          provider: "openai",
          base_url: "",
          model: "",
          temperature: 0.3,
          api_key: "",
        },
        projects: (parsed.projects || []).map((p: Project) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          color: p.color,
          created_at: p.createdAt,
        })),
      };
      await saveSettings(settings);

      for (const s of (parsed.skills || [])) {
        const skill: TauriSkill = {
          id: s.id,
          name: s.name,
          description: s.description,
          content: s.content,
          frontmatter: {
            model: s.frontmatter?.model || "gpt-4",
            temperature: s.frontmatter?.temperature ?? 0.3,
            context: s.frontmatter?.context || "fork",
            tools: s.frontmatter?.tools || [],
            skills: s.frontmatter?.skills || [],
            permissions: s.frontmatter?.permissions || [],
          },
          tags: s.tags || [],
          visibility: s.visibility || "global",
          project_id: s.projectId || null,
          platforms: Array.isArray(s.platforms) ? s.platforms : ["opencode", "claude"],
          updated_at: s.updatedAt || new Date().toISOString(),
          preferred_model: null,
          usage_examples: [],
        };
        await saveSkill(skill);
      }

      for (const sa of (parsed.subagents || [])) {
        const subagent: TauriSubagent = {
          id: sa.id,
          name: sa.name,
          role_prompt: sa.rolePrompt,
          description: sa.description,
          preferred_model: sa.preferredModel || null,
          parent_id: sa.parentId,
          allowed_tools: sa.allowedTools || [],
          preloaded_skill_ids: sa.preloadedSkillIds || [],
          usage_examples: sa.usageExamples || [],
          visibility: sa.visibility || "global",
          project_id: sa.projectId || null,
          platforms: Array.isArray(sa.platforms) ? sa.platforms : ["opencode", "claude"],
          context_behavior: sa.contextBehavior || "separate",
          updated_at: sa.updatedAt || new Date().toISOString(),
        };
        await saveSubagent(subagent);
      }
    } catch (e) {
      console.error("Failed to save to file:", e);
    }
  },
  removeItem: async (): Promise<void> => {
    try {
      const emptySettings: TauriAppSettings = {
        theme: "dark",
        locale: "en",
        active_view: "home",
        active_project_id: "",
        ai_settings: {
          mode: "hybrid",
          provider: "openai",
          base_url: "",
          model: "",
          temperature: 0.3,
          api_key: "",
        },
        projects: [],
      };
      await saveSettings(emptySettings);
    } catch (e) {
      console.error("Failed to clear file:", e);
    }
  },
};

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedAppState>(
    (set) => ({
      ...initialSnapshot,
      theme: "dark",
      locale: initialLocale,
      activeView: "home",
      activeProjectId: initialSnapshot.projects[0].id,
      aiSettings: {
        mode: "hybrid",
        provider: "openai",
        apiKey: "",
        baseUrl: aiProviderDefaults.openai.baseUrl,
        model: aiProviderDefaults.openai.model,
        temperature: 0.3,
      },
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) =>
        set((state) => {
          const localized = localizeStarterData(
            {
              projects: state.projects,
              skills: state.skills,
              subagents: state.subagents,
            },
            locale,
          );

          return {
            locale,
            projects: localized.projects,
            skills: localized.skills,
            subagents: localized.subagents,
          };
        }),
      setActiveView: (activeView) => set({ activeView }),
      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
      updateAiSettings: (settings) =>
        set((state) => ({
          aiSettings: {
            ...state.aiSettings,
            ...settings,
          },
        })),
      upsertProject: (project) =>
        set((state) => {
          if (project.id) {
            return {
              projects: state.projects.map((item) =>
                item.id === project.id
                  ? {
                      ...item,
                      name: project.name,
                      description: project.description,
                      color: project.color,
                    }
                  : item,
              ),
            };
          }

          return {
            projects: [
              ...state.projects,
              {
                id: createId("project"),
                createdAt: new Date().toISOString(),
                name: project.name,
                description: project.description,
                color: project.color,
              },
            ],
          };
        }),
      deleteProject: (projectId) =>
        set((state) => {
          if (state.projects.length === 1) {
            return state;
          }

          const nextProjects = state.projects.filter((project) => project.id !== projectId);
          const fallbackProject = nextProjects[0];

          return {
            projects: nextProjects,
            activeProjectId: state.activeProjectId === projectId ? fallbackProject.id : state.activeProjectId,
            skills: state.skills.map((skill) =>
              skill.projectId === projectId ? { ...skill, visibility: "global", projectId: null } : skill,
            ),
            subagents: state.subagents.map((subagent) =>
              subagent.projectId === projectId ? { ...subagent, visibility: "global", projectId: null } : subagent,
            ),
          };
        }),
      upsertSkill: (skill) =>
        set((state) => {
          const normalized = normalizeSnapshot({
            projects: state.projects,
            skills: state.skills.some((item) => item.id === skill.id)
              ? state.skills.map((item) => (item.id === skill.id ? skill : item))
              : [skill, ...state.skills],
            subagents: state.subagents,
          });

          const tauriSkill: TauriSkill = {
            id: skill.id,
            name: skill.name,
            description: skill.description,
            content: skill.content,
            frontmatter: {
              model: skill.frontmatter.model,
              temperature: skill.frontmatter.temperature,
              context: skill.frontmatter.context,
              tools: skill.frontmatter.tools,
              skills: skill.frontmatter.skills,
              permissions: skill.frontmatter.permissions,
            },
            tags: skill.tags,
            visibility: skill.visibility,
            project_id: skill.projectId,
            platforms: Array.isArray(skill.platforms) ? skill.platforms : ["opencode", "claude"],
            updated_at: skill.updatedAt,
            preferred_model: null,
            usage_examples: [],
          };
          saveSkill(tauriSkill).catch(console.error);

          return {
            skills: normalized.skills,
            subagents: normalized.subagents,
          };
        }),
      deleteSkill: (skillId) =>
        set((state) => {
          deleteSkill(skillId).catch(console.error);
          return {
            skills: state.skills.filter((skill) => skill.id !== skillId),
            subagents: state.subagents.map((subagent) => ({
              ...subagent,
              preloadedSkillIds: subagent.preloadedSkillIds.filter((id) => id !== skillId),
            })),
          };
        }),
      upsertSubagent: (subagent) =>
        set((state) => {
          const candidate = wouldCreateSubagentCycle(state.subagents, subagent.id, subagent.parentId) ? { ...subagent, parentId: null } : subagent;
          const normalized = normalizeSnapshot({
            projects: state.projects,
            skills: state.skills,
            subagents: state.subagents.some((item) => item.id === candidate.id)
              ? state.subagents.map((item) => (item.id === candidate.id ? candidate : item))
              : [candidate, ...state.subagents],
          });

          const tauriSubagent: TauriSubagent = {
            id: candidate.id,
            name: candidate.name,
            role_prompt: candidate.rolePrompt,
            description: candidate.description,
            preferred_model: candidate.preferredModel || null,
            parent_id: candidate.parentId,
            allowed_tools: candidate.allowedTools,
            preloaded_skill_ids: candidate.preloadedSkillIds,
            usage_examples: candidate.usageExamples,
            visibility: candidate.visibility,
            project_id: candidate.projectId,
            platforms: Array.isArray(candidate.platforms) ? candidate.platforms : ["opencode", "claude"],
            context_behavior: candidate.contextBehavior,
            updated_at: candidate.updatedAt,
          };
          saveSubagent(tauriSubagent).catch(console.error);

          return {
            subagents: normalized.subagents,
          };
        }),
      deleteSubagent: (subagentId) =>
        set((state) => {
          deleteSubagent(subagentId).catch(console.error);
          return {
            subagents: state.subagents
              .filter((subagent) => subagent.id !== subagentId)
              .map((subagent) => ({
                ...subagent,
                parentId: subagent.parentId === subagentId ? null : subagent.parentId,
              })),
          };
        }),
      importSnapshot: (snapshot, mode) =>
        set((state) => {
          const normalizedSnapshot = normalizeSnapshot(snapshot);

          if (mode === "replace") {
            const projects = normalizedSnapshot.projects.length > 0 ? normalizedSnapshot.projects : state.projects;
            const activeProjectId = projects.some((p) => p.id === state.activeProjectId)
              ? state.activeProjectId
              : projects[0].id;

            return {
              ...normalizedSnapshot,
              projects,
              activeProjectId,
            };
          }

          const existingSkillIds = new Set(state.skills.map((s) => s.id));
          const existingSubagentIds = new Set(state.subagents.map((s) => s.id));
          const existingProjectIds = new Set(state.projects.map((project) => project.id));

          const merged = normalizeSnapshot({
            projects: [...state.projects, ...normalizedSnapshot.projects.filter((project) => !existingProjectIds.has(project.id))],
            skills: [...state.skills, ...normalizedSnapshot.skills.filter((skill) => !existingSkillIds.has(skill.id))],
            subagents: [...state.subagents, ...normalizedSnapshot.subagents.filter((subagent) => !existingSubagentIds.has(subagent.id))],
          });

          return {
            projects: merged.projects,
            skills: merged.skills,
            subagents: merged.subagents,
          };
        }),
      resetToStarter: () =>
        set((state) => {
          const starterSnapshot = getStarterSnapshot(state.locale);
          return {
            ...starterSnapshot,
            activeProjectId: starterSnapshot.projects[0].id,
            activeView: "home",
          };
        }),
    }),
    {
      name: "vibecode-studio-storage",
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state): PersistedAppState => ({
        theme: state.theme,
        locale: state.locale,
        activeView: state.activeView,
        activeProjectId: state.activeProjectId,
        aiSettings: state.aiSettings,
        projects: state.projects,
        skills: state.skills,
        subagents: state.subagents,
      }),
    },
  ),
);