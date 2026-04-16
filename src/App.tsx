import { Suspense, lazy, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/store/use-app-store";

const HomePage = lazy(() => import("@/pages/home-page").then((module) => ({ default: module.HomePage })));
const DashboardPage = lazy(() => import("@/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })));
const DocsPage = lazy(() => import("@/pages/docs-page").then((module) => ({ default: module.DocsPage })));
const ExportPage = lazy(() => import("@/pages/export-page").then((module) => ({ default: module.ExportPage })));
const ProjectsPage = lazy(() => import("@/pages/projects-page").then((module) => ({ default: module.ProjectsPage })));
const SkillsPage = lazy(() => import("@/pages/skills-page").then((module) => ({ default: module.SkillsPage })));
const SubagentsPage = lazy(() => import("@/pages/subagents-page").then((module) => ({ default: module.SubagentsPage })));

export default function App() {
  const [search, setSearch] = useState("");
  const { t } = useI18n();
  const theme = useAppStore((state) => state.theme);
  const activeView = useAppStore((state) => state.activeView);
  const activeProjectId = useAppStore((state) => state.activeProjectId);
  const projects = useAppStore((state) => state.projects);
  const skills = useAppStore((state) => state.skills);
  const subagents = useAppStore((state) => state.subagents);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const deferredSearch = useDeferredValue(search);
  const searchValue = deferredSearch.toLowerCase().trim();

  const skillIndex = useMemo(
    () =>
      skills.map((skill) => ({
        item: skill,
        haystack: [skill.name, skill.description, skill.content, ...skill.tags].join(" ").toLowerCase(),
      })),
    [skills],
  );

  const subagentIndex = useMemo(
    () =>
      subagents.map((subagent) => ({
        item: subagent,
        haystack: [subagent.name, subagent.description, subagent.rolePrompt, ...subagent.allowedTools, ...subagent.usageExamples].join(" ").toLowerCase(),
      })),
    [subagents],
  );

  const projectIndex = useMemo(
    () =>
      projects.map((project) => ({
        item: project,
        haystack: [project.name, project.description].join(" ").toLowerCase(),
      })),
    [projects],
  );

  const filteredSkills = useMemo(() => {
    return skillIndex.flatMap(({ item, haystack }) => {
      const skill = item;
      const inScope = skill.visibility === "global" || skill.projectId === activeProjectId;
      if (!inScope) return [];
      if (!searchValue) return [skill];

      return haystack.includes(searchValue) ? [skill] : [];
    });
  }, [activeProjectId, searchValue, skillIndex]);

  const filteredSubagents = useMemo(() => {
    return subagentIndex.flatMap(({ item, haystack }) => {
      const subagent = item;
      const inScope = subagent.visibility === "global" || subagent.projectId === activeProjectId;
      if (!inScope) return [];
      if (!searchValue) return [subagent];

      return haystack.includes(searchValue) ? [subagent] : [];
    });
  }, [activeProjectId, searchValue, subagentIndex]);

  const filteredProjects = useMemo(() => {
    return projectIndex.flatMap(({ item, haystack }) => {
      if (!searchValue || haystack.includes(searchValue)) {
        return [item];
      }

      return [];
    });
  }, [projectIndex, searchValue]);

  const snapshot = useMemo(
    () => ({
      projects,
      skills,
      subagents,
    }),
    [projects, skills, subagents],
  );

  const activePage = useMemo(() => {
    if (activeView === "home") {
      return <HomePage snapshot={snapshot} />;
    }

    if (activeView === "dashboard") {
      return <DashboardPage skills={filteredSkills} subagents={filteredSubagents} projects={filteredProjects} />;
    }

    if (activeView === "skills") {
      return <SkillsPage skills={filteredSkills} />;
    }

    if (activeView === "subagents") {
      return <SubagentsPage subagents={filteredSubagents} />;
    }

    if (activeView === "projects") {
      return <ProjectsPage projects={filteredProjects} />;
    }

    if (activeView === "export") {
      return <ExportPage snapshot={snapshot} />;
    }

    return <DocsPage />;
  }, [activeView, filteredProjects, filteredSkills, filteredSubagents, snapshot]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-mesh-gradient opacity-80" />
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar search={search} onSearchChange={setSearch} />
          <main className="flex-1 px-4 py-5 pb-24 sm:px-5 lg:px-8 xl:pb-6">
            <Suspense
              fallback={
                <div className="mx-auto w-full max-w-[1480px] rounded-3xl border border-border/60 bg-background/40 p-8 text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="mx-auto w-full max-w-[1480px]"
                >
                  {activePage}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        toastOptions={{
          duration: 3500,
          className: "!border-border !bg-card !text-card-foreground",
        }}
      />
      <MobileNav />
    </div>
  );
}
