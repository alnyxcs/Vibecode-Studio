import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStarterSnapshot, localizeStarterData } from "@/data/starter";
import { aiProviderDefaults } from "@/lib/constants";
import { normalizeSnapshot, wouldCreateSubagentCycle } from "@/lib/snapshot";
import { type AppDataSnapshot, type AppView, type Locale, type Project, type Skill, type Subagent, type ThemeMode } from "@/types";
import { createId } from "@/lib/utils";

import { type AiSettings } from "@/types";

const initialLocale: Locale = "en";
const initialSnapshot = getStarterSnapshot(initialLocale);

const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

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

type PersistedAiSettings = Omit<AiSettings, "apiKey">;
type PersistedAppState = Omit<Pick<AppState, "theme" | "locale" | "activeView" | "activeProjectId" | "aiSettings" | "projects" | "skills" | "subagents">, "aiSettings"> & {
  aiSettings: PersistedAiSettings;
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

          return {
            skills: normalized.skills,
            subagents: normalized.subagents,
          };
        }),
      deleteSkill: (skillId) =>
        set((state) => ({
          skills: state.skills.filter((skill) => skill.id !== skillId),
          subagents: state.subagents.map((subagent) => ({
            ...subagent,
            preloadedSkillIds: subagent.preloadedSkillIds.filter((id) => id !== skillId),
          })),
        })),
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

          return {
            subagents: normalized.subagents,
          };
        }),
      deleteSubagent: (subagentId) =>
        set((state) => ({
          subagents: state.subagents
            .filter((subagent) => subagent.id !== subagentId)
            .map((subagent) => ({
              ...subagent,
              parentId: subagent.parentId === subagentId ? null : subagent.parentId,
            })),
        })),
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
      storage: {
        getItem: (name) => {
          const raw = safeStorage.getItem(name);
          if (!raw) {
            return null;
          }

          try {
            return JSON.parse(raw);
          } catch {
            safeStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          safeStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          safeStorage.removeItem(name);
        },
      },
        partialize: (state): PersistedAppState => ({
          theme: state.theme,
          locale: state.locale,
          activeView: state.activeView,
          activeProjectId: state.activeProjectId,
          aiSettings: {
            mode: state.aiSettings.mode,
            provider: state.aiSettings.provider,
            baseUrl: state.aiSettings.baseUrl,
            model: state.aiSettings.model,
            temperature: state.aiSettings.temperature,
          },
          projects: state.projects,
          skills: state.skills,
          subagents: state.subagents,
        }),
    },
  ),
);
