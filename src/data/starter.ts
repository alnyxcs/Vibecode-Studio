import { type AppDataSnapshot, type Locale, type Project, type Skill, type Subagent } from "@/types";

function cloneSnapshot(snapshot: AppDataSnapshot): AppDataSnapshot {
  return {
    projects: snapshot.projects.map((project) => ({ ...project })),
    skills: snapshot.skills.map((skill) => ({
      ...skill,
      tags: [...skill.tags],
      frontmatter: {
        ...skill.frontmatter,
        tools: [...skill.frontmatter.tools],
        skills: [...skill.frontmatter.skills],
        permissions: [...skill.frontmatter.permissions],
      },
    })),
    subagents: snapshot.subagents.map((subagent) => ({
      ...subagent,
      preloadedSkillIds: [...subagent.preloadedSkillIds],
      allowedTools: [...subagent.allowedTools],
      usageExamples: [...subagent.usageExamples],
    })),
  };
}

function sameValue<T>(left: T, right: T) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function localizeCollection<T extends { id: string }>(items: T[], locale: Locale, pick: (snapshot: AppDataSnapshot) => T[]) {
  const targetById = new Map(pick(starterSnapshots[locale]).map((item) => [item.id, item]));
  const variantsById = new Map<string, T[]>();

  for (const snapshot of Object.values(starterSnapshots)) {
    for (const item of pick(snapshot)) {
      const variants = variantsById.get(item.id) ?? [];
      variants.push(item);
      variantsById.set(item.id, variants);
    }
  }

  return items.map((item) => {
    const target = targetById.get(item.id);
    const variants = variantsById.get(item.id) ?? [];

    if (!target || !variants.some((variant) => sameValue(variant, item))) {
      return item;
    }

    return structuredClone(target);
  });
}

const enMainProject: Project = {
  id: "project_main",
  name: "Main Workspace",
  description: "Default workspace for reusable skills and cross-project subagents.",
  color: "from-violet-500 to-cyan-500",
  createdAt: "2026-04-15T09:00:00.000Z",
};

const enMobileProject: Project = {
  id: "project_mobile",
  name: "Android Client",
  description: "Workspace focused on shipping Kotlin + TDLib helper agents.",
  color: "from-fuchsia-500 to-indigo-500",
  createdAt: "2026-04-15T09:10:00.000Z",
};

const ruMainProject: Project = {
  id: "project_main",
  name: "Основной workspace",
  description: "Базовый workspace для переиспользуемых скиллов и межпроектных сабагентов.",
  color: "from-violet-500 to-cyan-500",
  createdAt: "2026-04-15T09:00:00.000Z",
};

const ruMobileProject: Project = {
  id: "project_mobile",
  name: "Android-клиент",
  description: "Workspace для агентов и помощников вокруг Kotlin + TDLib.",
  color: "from-fuchsia-500 to-indigo-500",
  createdAt: "2026-04-15T09:10:00.000Z",
};

const englishSnapshot: AppDataSnapshot = {
  projects: [enMainProject, enMobileProject],
  skills: [
    {
      id: "skill_reviewer",
      name: "Reviewer",
      description: "Finds correctness issues, regressions, and missing tests before code lands.",
      content: `# Reviewer\n\nYou review production code with a bias for real defects.\n\n## Focus\n- user-facing regressions\n- missing validation\n- hidden state or async bugs\n- gaps in test coverage\n\n## Output\n1. Findings ordered by severity\n2. File references\n3. Short remediation advice`,
      frontmatter: {
        model: "sonnet-4",
        temperature: 0.2,
        context: "main",
        tools: ["Read", "Grep", "Glob"],
        skills: [],
        permissions: ["read-only"],
      },
      tags: ["review", "quality", "tests"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:00:00.000Z",
    },
    {
      id: "skill_planner",
      name: "Planner",
      description: "Breaks down complex engineering work into the smallest useful execution path.",
      content: `# Planner\n\nYou create pragmatic plans.\n\n## Rules\n- prefer minimal viable changes\n- identify dependencies early\n- separate discovery from implementation\n- always define verification steps`,
      frontmatter: {
        model: "gpt-4.1",
        temperature: 0.3,
        context: "main",
        tools: ["Read", "Glob", "Grep"],
        skills: [],
        permissions: ["planning", "analysis"],
      },
      tags: ["planning", "delivery"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:20:00.000Z",
    },
    {
      id: "skill_explorer",
      name: "Explorer",
      description: "Maps codebases fast and identifies the exact files to touch.",
      content: `# Explorer\n\nYou search broadly before editing.\n\n## Behavior\n- start with file patterns\n- follow with code search\n- summarize architecture in plain language\n- avoid speculative edits`,
      frontmatter: {
        model: "haiku",
        temperature: 0.1,
        context: "fork",
        tools: ["Read", "Glob", "Grep"],
        skills: [],
        permissions: ["read-only"],
      },
      tags: ["research", "mapping"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:40:00.000Z",
    },
    {
      id: "skill_git",
      name: "Git Expert",
      description: "Drafts safe commit messages, PR summaries, and branch hygiene checks.",
      content: `# Git Expert\n\nYou work safely with repositories.\n\n## Safety\n- never force push protected branches\n- prefer new commits over amend\n- summarize changes by intent\n- verify hooks and status before commit`,
      frontmatter: {
        model: "sonnet-4",
        temperature: 0.15,
        context: "main",
        tools: ["Bash", "Read", "Grep"],
        skills: [],
        permissions: ["git"],
      },
      tags: ["git", "pr", "release"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T11:00:00.000Z",
    },
    {
      id: "skill_refactor",
      name: "Refactor",
      description: "Improves code structure while keeping changes minimal and behavior stable.",
      content: `# Refactor\n\nYou simplify code without rewriting it.\n\n## Priorities\n- preserve public behavior\n- remove indirection when unnecessary\n- make data flow easier to follow\n- add comments only for non-obvious logic`,
      frontmatter: {
        model: "opus",
        temperature: 0.25,
        context: "fork",
        tools: ["Read", "Edit", "Grep", "Glob"],
        skills: ["Reviewer"],
        permissions: ["write"],
      },
      tags: ["cleanup", "maintainability"],
      visibility: "project",
      projectId: enMobileProject.id,
      platforms: "opencode",
      updatedAt: "2026-04-15T11:15:00.000Z",
    },
    {
      id: "skill_docs",
      name: "Docs Writer",
      description: "Writes concise README sections, migration notes, and usage examples.",
      content: `# Docs Writer\n\nYou turn implementation details into clear developer-facing docs.\n\n## Deliverables\n- setup instructions\n- examples\n- constraints and caveats\n- next-step references`,
      frontmatter: {
        model: "gpt-4.1",
        temperature: 0.35,
        context: "main",
        tools: ["Read", "Edit"],
        skills: [],
        permissions: ["docs"],
      },
      tags: ["docs", "readme"],
      visibility: "global",
      projectId: null,
      platforms: "claude",
      updatedAt: "2026-04-15T11:35:00.000Z",
    },
  ],
  subagents: [
    {
      id: "agent_orchestrator",
      name: "planner",
      rolePrompt: "You orchestrate coding work across specialist subagents. Keep plans tight, sequence tasks clearly, and hand off only when a specialist adds value.",
      description: "Top-level coordinator for discovery, execution, and verification.",
      preferredModel: "sonnet-4",
      preloadedSkillIds: ["skill_planner", "skill_explorer"],
      allowedTools: ["Read", "Glob", "Grep", "Task"],
      contextBehavior: "share",
      parentId: null,
      usageExamples: ["@planner decompose this migration", "@planner outline the safest delivery path"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:00:00.000Z",
    },
    {
      id: "agent_reviewer",
      name: "reviewer",
      rolePrompt: "You review diffs for bugs and risk. Findings come first. Call out likely regressions, edge cases, and missing tests with file references.",
      description: "Focused review agent for correctness and release risk.",
      preferredModel: "sonnet-4",
      preloadedSkillIds: ["skill_reviewer"],
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      contextBehavior: "separate",
      parentId: "agent_orchestrator",
      usageExamples: ["@reviewer inspect this diff", "@reviewer find release blockers before merge"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:10:00.000Z",
    },
    {
      id: "agent_explorer",
      name: "explorer",
      rolePrompt: "You map unknown codebases quickly. Start wide, narrow with evidence, and return exact files plus a short architectural summary.",
      description: "Fast repo scout for unfamiliar systems.",
      preferredModel: "haiku",
      preloadedSkillIds: ["skill_explorer"],
      allowedTools: ["Read", "Glob", "Grep"],
      contextBehavior: "separate",
      parentId: "agent_orchestrator",
      usageExamples: ["@explorer locate auth flow entry points", "@explorer find every webhook consumer"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:15:00.000Z",
    },
    {
      id: "agent_git",
      name: "git-expert",
      rolePrompt: "You prepare commits and PRs safely. Respect hooks, avoid destructive git commands, and write concise why-focused commit messages.",
      description: "Repository hygiene specialist.",
      preferredModel: "gpt-4.1",
      preloadedSkillIds: ["skill_git"],
      allowedTools: ["Bash", "Read"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@git-expert draft a commit message", "@git-expert prepare a PR summary"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:20:00.000Z",
    },
    {
      id: "agent_refactor",
      name: "refactor",
      rolePrompt: "You improve structure without rewriting working code. Prefer the smallest refactor that makes the intent clearer.",
      description: "Low-risk structural cleanup agent.",
      preferredModel: "opus",
      preloadedSkillIds: ["skill_refactor", "skill_reviewer"],
      allowedTools: ["Read", "Edit", "Glob", "Grep", "Bash"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@refactor simplify this component tree", "@refactor reduce state duplication"],
      visibility: "project",
      projectId: enMobileProject.id,
      platforms: "opencode",
      updatedAt: "2026-04-15T12:30:00.000Z",
    },
    {
      id: "agent_docs",
      name: "docs",
      rolePrompt: "You explain systems clearly for developers. Keep instructions direct, concrete, and easy to scan.",
      description: "Documentation and onboarding helper.",
      preferredModel: "gpt-4.1",
      preloadedSkillIds: ["skill_docs"],
      allowedTools: ["Read", "Edit"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@docs write a README section", "@docs explain this deployment flow"],
      visibility: "global",
      projectId: null,
      platforms: "claude",
      updatedAt: "2026-04-15T12:40:00.000Z",
    },
  ],
};

const russianSnapshot: AppDataSnapshot = {
  projects: [ruMainProject, ruMobileProject],
  skills: [
    {
      id: "skill_reviewer",
      name: "Ревьюер",
      description: "Находит ошибки корректности, регрессии и недостающие тесты до попадания кода в основную ветку.",
      content: `# Ревьюер\n\nВы проверяете production-код с фокусом на реальные дефекты.\n\n## Фокус\n- регрессии в пользовательском поведении\n- пропущенная валидация\n- скрытые state- или async-баги\n- пробелы в тестовом покрытии\n\n## Вывод\n1. Замечания по убыванию критичности\n2. Ссылки на файлы\n3. Короткие рекомендации по исправлению`,
      frontmatter: {
        model: "sonnet-4",
        temperature: 0.2,
        context: "main",
        tools: ["Read", "Grep", "Glob"],
        skills: [],
        permissions: ["read-only"],
      },
      tags: ["ревью", "качество", "тесты"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:00:00.000Z",
    },
    {
      id: "skill_planner",
      name: "Планировщик",
      description: "Разбивает сложную инженерную задачу на минимальный полезный путь выполнения.",
      content: `# Планировщик\n\nВы создаёте прагматичные планы.\n\n## Правила\n- предпочитайте минимально достаточные изменения\n- заранее выявляйте зависимости\n- разделяйте исследование и реализацию\n- всегда определяйте шаги проверки`,
      frontmatter: {
        model: "gpt-4.1",
        temperature: 0.3,
        context: "main",
        tools: ["Read", "Glob", "Grep"],
        skills: [],
        permissions: ["planning", "analysis"],
      },
      tags: ["планирование", "доставка"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:20:00.000Z",
    },
    {
      id: "skill_explorer",
      name: "Исследователь",
      description: "Быстро картирует кодовую базу и находит точные файлы для изменений.",
      content: `# Исследователь\n\nВы широко ищете контекст до начала правок.\n\n## Поведение\n- начинайте с шаблонов файлов\n- затем переходите к поиску по коду\n- кратко описывайте архитектуру простым языком\n- избегайте спекулятивных правок`,
      frontmatter: {
        model: "haiku",
        temperature: 0.1,
        context: "fork",
        tools: ["Read", "Glob", "Grep"],
        skills: [],
        permissions: ["read-only"],
      },
      tags: ["исследование", "карта"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T10:40:00.000Z",
    },
    {
      id: "skill_git",
      name: "Git-эксперт",
      description: "Готовит безопасные commit message, PR summary и проверки чистоты ветки.",
      content: `# Git-эксперт\n\nВы работаете с репозиториями безопасно.\n\n## Безопасность\n- никогда не делайте force push в защищённые ветки\n- предпочитайте новые коммиты вместо amend\n- описывайте изменения через их намерение\n- перед коммитом проверяйте hooks и status`,
      frontmatter: {
        model: "sonnet-4",
        temperature: 0.15,
        context: "main",
        tools: ["Bash", "Read", "Grep"],
        skills: [],
        permissions: ["git"],
      },
      tags: ["git", "pr", "релиз"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T11:00:00.000Z",
    },
    {
      id: "skill_refactor",
      name: "Рефакторинг",
      description: "Улучшает структуру кода, сохраняя изменения минимальными и поведение стабильным.",
      content: `# Рефакторинг\n\nВы упрощаете код без его переписывания заново.\n\n## Приоритеты\n- сохраняйте публичное поведение\n- убирайте лишнюю косвенность\n- делайте поток данных проще для чтения\n- добавляйте комментарии только там, где логика неочевидна`,
      frontmatter: {
        model: "opus",
        temperature: 0.25,
        context: "fork",
        tools: ["Read", "Edit", "Grep", "Glob"],
        skills: ["Ревьюер"],
        permissions: ["write"],
      },
      tags: ["чистка", "поддерживаемость"],
      visibility: "project",
      projectId: ruMobileProject.id,
      platforms: "opencode",
      updatedAt: "2026-04-15T11:15:00.000Z",
    },
    {
      id: "skill_docs",
      name: "Документатор",
      description: "Пишет лаконичные разделы README, migration notes и примеры использования.",
      content: `# Документатор\n\nВы превращаете детали реализации в понятную документацию для разработчиков.\n\n## Результат\n- инструкции по настройке\n- примеры\n- ограничения и caveats\n- ссылки на следующие шаги`,
      frontmatter: {
        model: "gpt-4.1",
        temperature: 0.35,
        context: "main",
        tools: ["Read", "Edit"],
        skills: [],
        permissions: ["docs"],
      },
      tags: ["документация", "readme"],
      visibility: "global",
      projectId: null,
      platforms: "claude",
      updatedAt: "2026-04-15T11:35:00.000Z",
    },
  ],
  subagents: [
    {
      id: "agent_orchestrator",
      name: "planner",
      rolePrompt: "Вы оркестрируете инженерную работу между специализированными сабагентами. Держите план плотным, шаги последовательными и делайте handoff только там, где специалист действительно полезен.",
      description: "Верхнеуровневый координатор для исследования, выполнения и проверки.",
      preferredModel: "sonnet-4",
      preloadedSkillIds: ["skill_planner", "skill_explorer"],
      allowedTools: ["Read", "Glob", "Grep", "Task"],
      contextBehavior: "share",
      parentId: null,
      usageExamples: ["@planner декомпозируй эту миграцию", "@planner опиши самый безопасный путь доставки"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:00:00.000Z",
    },
    {
      id: "agent_reviewer",
      name: "reviewer",
      rolePrompt: "Вы проверяете diff на баги и риски. Findings идут первыми. Отмечайте вероятные регрессии, edge cases и недостающие тесты со ссылками на файлы.",
      description: "Агент для ревью корректности и рисков релиза.",
      preferredModel: "sonnet-4",
      preloadedSkillIds: ["skill_reviewer"],
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      contextBehavior: "separate",
      parentId: "agent_orchestrator",
      usageExamples: ["@reviewer проверь этот diff", "@reviewer найди блокеры релиза перед merge"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:10:00.000Z",
    },
    {
      id: "agent_explorer",
      name: "explorer",
      rolePrompt: "Вы быстро картируете незнакомые кодовые базы. Начинайте широко, сужайте поиск на основе фактов и возвращайте точные файлы вместе с короткой сводкой по архитектуре.",
      description: "Быстрый разведчик репозитория для незнакомых систем.",
      preferredModel: "haiku",
      preloadedSkillIds: ["skill_explorer"],
      allowedTools: ["Read", "Glob", "Grep"],
      contextBehavior: "separate",
      parentId: "agent_orchestrator",
      usageExamples: ["@explorer найди точки входа auth flow", "@explorer найди всех потребителей webhook"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:15:00.000Z",
    },
    {
      id: "agent_git",
      name: "git-expert",
      rolePrompt: "Вы безопасно подготавливаете коммиты и PR. Уважайте hooks, избегайте destructive git commands и пишите короткие commit message с фокусом на why.",
      description: "Специалист по чистоте и дисциплине репозитория.",
      preferredModel: "gpt-4.1",
      preloadedSkillIds: ["skill_git"],
      allowedTools: ["Bash", "Read"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@git-expert подготовь commit message", "@git-expert составь PR summary"],
      visibility: "global",
      projectId: null,
      platforms: "both",
      updatedAt: "2026-04-15T12:20:00.000Z",
    },
    {
      id: "agent_refactor",
      name: "refactor",
      rolePrompt: "Вы улучшаете структуру без переписывания рабочего кода. Предпочитайте самый маленький рефакторинг, который делает намерение кода яснее.",
      description: "Агент для низкорисковой структурной чистки.",
      preferredModel: "opus",
      preloadedSkillIds: ["skill_refactor", "skill_reviewer"],
      allowedTools: ["Read", "Edit", "Glob", "Grep", "Bash"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@refactor упрости это дерево компонентов", "@refactor сократи дублирование state"],
      visibility: "project",
      projectId: ruMobileProject.id,
      platforms: "opencode",
      updatedAt: "2026-04-15T12:30:00.000Z",
    },
    {
      id: "agent_docs",
      name: "docs",
      rolePrompt: "Вы понятно объясняете системы для разработчиков. Пишите прямо, конкретно и так, чтобы текст было легко сканировать.",
      description: "Помощник по документации и онбордингу.",
      preferredModel: "gpt-4.1",
      preloadedSkillIds: ["skill_docs"],
      allowedTools: ["Read", "Edit"],
      contextBehavior: "share",
      parentId: "agent_orchestrator",
      usageExamples: ["@docs напиши раздел README", "@docs объясни этот deployment flow"],
      visibility: "global",
      projectId: null,
      platforms: "claude",
      updatedAt: "2026-04-15T12:40:00.000Z",
    },
  ],
};

const starterSnapshots: Record<Locale, AppDataSnapshot> = {
  en: englishSnapshot,
  ru: russianSnapshot,
};

export function getStarterSnapshot(locale: Locale): AppDataSnapshot {
  return cloneSnapshot(starterSnapshots[locale]);
}

export function localizeStarterData(snapshot: AppDataSnapshot, locale: Locale): AppDataSnapshot {
  return {
    projects: localizeCollection(snapshot.projects, locale, (value) => value.projects),
    skills: localizeCollection(snapshot.skills, locale, (value) => value.skills),
    subagents: localizeCollection(snapshot.subagents, locale, (value) => value.subagents),
  };
}

export const starterSnapshot = getStarterSnapshot("en");
