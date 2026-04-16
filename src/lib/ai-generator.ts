import { aiProviderDefaults, modelOptions, permissionOptions, toolOptions } from "@/lib/constants";
import { parseList, slugify } from "@/lib/utils";
import { type AiSettings, type GeneratedSkillDraft, type GeneratedSubagentDraft, type Project, type Skill, type Subagent } from "@/types";
import { z } from "zod";

interface SkillGenerationInput {
  prompt: string;
  platforms: "opencode" | "claude" | "both";
  projectId: string | null;
  projects: Project[];
  skills: Skill[];
}

interface SubagentGenerationInput {
  prompt: string;
  platforms: "opencode" | "claude" | "both";
  projectId: string | null;
  skills: Skill[];
  subagents: Subagent[];
}

const skillDraftSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  frontmatter: z.object({
    model: z.string().min(1),
    temperature: z.number().min(0).max(1),
    context: z.enum(["fork", "main"]),
    tools: z.array(z.string()),
    skills: z.array(z.string()),
    permissions: z.array(z.string()),
  }),
  tags: z.array(z.string()),
  visibility: z.enum(["global", "project"]),
  projectId: z.string().nullable(),
  platforms: z.enum(["opencode", "claude", "both"]),
});

const subagentDraftSchema = z.object({
  name: z.string().min(1),
  rolePrompt: z.string().min(1),
  description: z.string().min(1),
  preferredModel: z.string().min(1),
  preloadedSkillIds: z.array(z.string()),
  allowedTools: z.array(z.string()),
  contextBehavior: z.enum(["separate", "share"]),
  parentId: z.string().nullable(),
  usageExamples: z.array(z.string()),
  visibility: z.enum(["global", "project"]),
  projectId: z.string().nullable(),
  platforms: z.enum(["opencode", "claude", "both"]),
});

function pickTools(prompt: string) {
  const text = prompt.toLowerCase();
  return toolOptions.filter((tool) => text.includes(tool.toLowerCase())).slice(0, 6);
}

function pickPermissions(prompt: string) {
  const text = prompt.toLowerCase();
  return permissionOptions.filter((permission) => text.includes(permission.toLowerCase())).slice(0, 4);
}

function chooseModel(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes("review") || text.includes("audit")) return "sonnet-4";
  if (text.includes("fast") || text.includes("search") || text.includes("explore")) return "haiku";
  if (text.includes("refactor") || text.includes("architecture")) return "opus";
  return modelOptions[0];
}

function inferTags(prompt: string) {
  const candidates = [
    "review",
    "planning",
    "refactor",
    "git",
    "docs",
    "testing",
    "frontend",
    "backend",
    "api",
    "debugging",
    "research",
    "architecture",
  ];

  const text = prompt.toLowerCase();
  const matches = candidates.filter((tag) => text.includes(tag));
  return matches.length > 0 ? matches.slice(0, 4) : ["generated", "assistant"];
}

function titleCasePrompt(prompt: string, fallback: string) {
  const cleaned = prompt.replace(/[^a-zA-Z0-9\s-]/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(/\s+/)
    .slice(0, 4)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function localSkillDraft(input: SkillGenerationInput): GeneratedSkillDraft {
  const baseName = titleCasePrompt(input.prompt, "Generated Skill");
  const tags = inferTags(input.prompt);
  const tools = pickTools(input.prompt);
  const permissions = pickPermissions(input.prompt);

  return {
    name: baseName,
    description: `AI-generated skill for ${input.prompt.toLowerCase().slice(0, 80)}${input.prompt.length > 80 ? "..." : ""}`,
    content: `# ${baseName}\n\nYou are a focused skill for the following task:\n\n> ${input.prompt}\n\n## Responsibilities\n- clarify the target outcome before acting\n- prefer minimal, production-safe changes\n- surface tradeoffs only when they change the implementation path\n- keep outputs easy to paste into OpenCode or Claude Code\n\n## Workflow\n1. Inspect relevant context first\n2. Propose or execute the smallest correct change\n3. Verify the result with concrete checks\n4. Return concise output with next useful action\n\n## Output format\n- short summary\n- concrete actions or findings\n- file references or generated assets when relevant`,
    frontmatter: {
      model: chooseModel(input.prompt),
      temperature: 0.3,
      context: input.prompt.toLowerCase().includes("separate") ? "fork" : "main",
      tools: tools.length > 0 ? tools : ["Read", "Grep", "Glob"],
      skills: input.skills.slice(0, 2).map((skill) => skill.name),
      permissions: permissions.length > 0 ? permissions : ["read-only"],
    },
    tags,
    visibility: input.projectId ? "project" : "global",
    projectId: input.projectId,
    platforms: input.platforms,
  };
}

function localSubagentDraft(input: SubagentGenerationInput): GeneratedSubagentDraft {
  const baseName = slugify(titleCasePrompt(input.prompt, "generated-agent")).replace(/-/g, "-");
  const toolMatches = pickTools(input.prompt);
  const likelySkills = input.skills
    .filter((skill) => {
      const haystack = `${skill.name} ${skill.description} ${skill.tags.join(" ")}`.toLowerCase();
      return inferTags(input.prompt).some((tag) => haystack.includes(tag));
    })
    .slice(0, 3)
    .map((skill) => skill.id);

  return {
    name: baseName.startsWith("generated") ? "generated-agent" : baseName,
    description: `AI-generated subagent for ${input.prompt.toLowerCase().slice(0, 80)}${input.prompt.length > 80 ? "..." : ""}`,
    rolePrompt: `You are @${baseName.startsWith("generated") ? "generated-agent" : baseName}, a specialist subagent.\n\nPrimary mission: ${input.prompt}\n\nOperating rules:\n- work with a senior engineer mindset\n- inspect context before making assumptions\n- keep changes minimal and production-safe\n- return findings first when reviewing or diagnosing\n- provide ready-to-run output when asked to implement\n\nWhen the request is ambiguous, ask only the shortest clarifying question that unblocks execution.`,
    preferredModel: chooseModel(input.prompt),
    preloadedSkillIds: likelySkills,
    allowedTools: toolMatches.length > 0 ? toolMatches : ["Read", "Glob", "Grep"],
    contextBehavior: input.prompt.toLowerCase().includes("share context") ? "share" : "separate",
    parentId: null,
    usageExamples: [
      `@${baseName.startsWith("generated") ? "generated-agent" : baseName} ${input.prompt}`,
      `@${baseName.startsWith("generated") ? "generated-agent" : baseName} produce the safest execution path`,
    ],
    visibility: input.projectId ? "project" : "global",
    projectId: input.projectId,
    platforms: input.platforms,
  };
}

function providerHeaders(settings: AiSettings): Record<string, string> {
  if (settings.provider === "anthropic") {
    return {
      "content-type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  if (settings.provider === "gemini") {
    return {
      "content-type": "application/json",
    };
  }

  return {
    "content-type": "application/json",
    authorization: `Bearer ${settings.apiKey}`,
  };
}

function isOpenAiCompatibleProvider(provider: AiSettings["provider"]) {
  return [
    "openai",
    "openrouter",
    "groq",
    "deepseek",
    "mistral",
    "xai",
    "together",
    "fireworks",
    "perplexity",
    "ollama",
    "cerebras",
    "sambanova",
    "hyperbolic",
    "moonshot",
    "nebius",
    "custom",
  ].includes(provider);
}

function stripMarkdownFences(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseJsonCandidate<T>(candidate: string): T | null {
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function extractJson<T>(raw: string): T {
  const cleaned = stripMarkdownFences(raw);
  const direct = parseJsonCandidate<T>(cleaned);
  if (direct) {
    return direct;
  }

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth === 0 || start === -1) {
        continue;
      }

      depth -= 1;
      if (depth === 0) {
        const candidate = cleaned.slice(start, index + 1);
        const parsed = parseJsonCandidate<T>(candidate);
        if (parsed) {
          return parsed;
        }
        start = -1;
      }
    }
  }

  throw new Error("The model returned invalid JSON.");
}

async function readResponseBody(response: Response) {
  const text = await response.text();
  const json = parseJsonCandidate<unknown>(text);
  return { text, json };
}

function apiErrorMessage(provider: AiSettings["provider"], status: number, body: { text: string; json: unknown }) {
  const json = body.json as Record<string, unknown> | null;

  if (provider === "anthropic") {
    const message = typeof json?.error === "object" && json.error && "message" in json.error ? String((json.error as Record<string, unknown>).message) : null;
    if (message) return message;
  }

  if (provider === "gemini") {
    const message = typeof json?.error === "object" && json.error && "message" in json.error ? String((json.error as Record<string, unknown>).message) : null;
    if (message) return message;
  }

  const openAiMessage = typeof json?.error === "object" && json.error && "message" in json.error ? String((json.error as Record<string, unknown>).message) : null;
  if (openAiMessage) {
    return openAiMessage;
  }

  const text = body.text.trim();
  if (text) {
    return text.slice(0, 240);
  }

  return `Request failed with status ${status}.`;
}

async function readSuccessfulJson(response: Response, settings: AiSettings) {
  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(apiErrorMessage(settings.provider, response.status, body));
  }

  if (!body.json) {
    throw new Error("The provider returned an unreadable response.");
  }

  return body.json as Record<string, unknown>;
}

function normalizeSkillDraft(value: GeneratedSkillDraft, fallback: GeneratedSkillDraft) {
  return skillDraftSchema.parse({
    ...fallback,
    ...value,
    frontmatter: {
      ...fallback.frontmatter,
      ...value.frontmatter,
      tools: Array.isArray(value.frontmatter?.tools) ? value.frontmatter.tools.map(String) : fallback.frontmatter.tools,
      skills: Array.isArray(value.frontmatter?.skills) ? value.frontmatter.skills.map(String) : fallback.frontmatter.skills,
      permissions: Array.isArray(value.frontmatter?.permissions) ? value.frontmatter.permissions.map(String) : fallback.frontmatter.permissions,
      temperature: typeof value.frontmatter?.temperature === "number" ? value.frontmatter.temperature : fallback.frontmatter.temperature,
    },
    tags: Array.isArray(value.tags) ? value.tags.map(String) : fallback.tags,
  });
}

function normalizeSubagentDraft(value: GeneratedSubagentDraft, fallback: GeneratedSubagentDraft) {
  return subagentDraftSchema.parse({
    ...fallback,
    ...value,
    preloadedSkillIds: Array.isArray(value.preloadedSkillIds) ? value.preloadedSkillIds.map(String) : fallback.preloadedSkillIds,
    allowedTools: Array.isArray(value.allowedTools) ? value.allowedTools.map(String) : fallback.allowedTools,
    usageExamples: Array.isArray(value.usageExamples) ? value.usageExamples.map(String) : fallback.usageExamples,
  });
}

async function callApi(settings: AiSettings, kind: "skill" | "subagent", prompt: string) {
  const schemaInstruction =
    kind === "skill"
      ? `Return strict JSON only with keys: name, description, content, frontmatter, tags, visibility, projectId, platforms. frontmatter must include model, temperature, context, tools, skills, permissions.`
      : `Return strict JSON only with keys: name, rolePrompt, description, preferredModel, preloadedSkillIds, allowedTools, contextBehavior, parentId, usageExamples, visibility, projectId, platforms.`;

  const system = `You generate production-ready ${kind} drafts for an app that exports to OpenCode and Claude Code. ${schemaInstruction}`;
  const user = `Generate a ${kind} draft from this request:\n\n${prompt}`;

  if (settings.provider === "anthropic") {
    const response = await fetch(`${settings.baseUrl}/messages`, {
      method: "POST",
      headers: providerHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 1800,
        temperature: settings.temperature,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = await readSuccessfulJson(response, settings);
    const content = Array.isArray(data.content) ? data.content : [];
    const textBlock = content.find((item) => item && typeof item === "object" && (item as Record<string, unknown>).type === "text") as Record<string, unknown> | undefined;
    const text = typeof textBlock?.text === "string" ? textBlock.text : "";
    if (!text.trim()) {
      throw new Error("The provider returned an empty response.");
    }
    return text;
  }

  if (settings.provider === "gemini") {
    const response = await fetch(`${settings.baseUrl}/models/${settings.model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`, {
      method: "POST",
      headers: providerHeaders(settings),
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: {
          temperature: settings.temperature,
        },
      }),
    });
    const data = await readSuccessfulJson(response, settings);
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    const first = candidates[0] as Record<string, unknown> | undefined;
    const content = first && typeof first.content === "object" ? (first.content as Record<string, unknown>) : null;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    const text = parts
      .map((part) => (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string" ? String((part as Record<string, unknown>).text) : ""))
      .join("\n")
      .trim();
    if (!text) {
      throw new Error("The provider returned an empty response.");
    }
    return text;
  }

  if (isOpenAiCompatibleProvider(settings.provider)) {
    if (!settings.baseUrl) {
      throw new Error("Base URL is required for custom and OpenAI-compatible providers.");
    }
    const response = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: "POST",
      headers: providerHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        temperature: settings.temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    const data = await readSuccessfulJson(response, settings);
    const choices = Array.isArray(data.choices) ? data.choices : [];
    const first = choices[0] as Record<string, unknown> | undefined;
    const message = first && typeof first.message === "object" ? (first.message as Record<string, unknown>) : null;
    const content = message?.content;
    const text = typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) => (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string" ? String((part as Record<string, unknown>).text) : ""))
            .join("\n")
        : "";
    if (!text.trim()) {
      throw new Error("The provider returned an empty response.");
    }
    return text;
  }

  throw new Error(`Unsupported provider: ${settings.provider}`);
}

export async function generateSkillDraft(settings: AiSettings, input: SkillGenerationInput): Promise<GeneratedSkillDraft> {
  const fallback = localSkillDraft(input);

  if (settings.mode === "local") {
    return fallback;
  }

  if (!settings.apiKey) {
    if (settings.mode === "api") {
      throw new Error("API key is required for API generation mode.");
    }
    return fallback;
  }

  try {
    const raw = await callApi(settings, "skill", input.prompt);
    const parsed = extractJson<Partial<GeneratedSkillDraft>>(raw);
    return normalizeSkillDraft(parsed as GeneratedSkillDraft, fallback);
  } catch (error) {
    if (settings.mode === "api") {
      throw error;
    }
    return fallback;
  }
}

export async function generateSubagentDraft(settings: AiSettings, input: SubagentGenerationInput): Promise<GeneratedSubagentDraft> {
  const fallback = localSubagentDraft(input);

  if (settings.mode === "local") {
    return fallback;
  }

  if (!settings.apiKey) {
    if (settings.mode === "api") {
      throw new Error("API key is required for API generation mode.");
    }
    return fallback;
  }

  try {
    const raw = await callApi(settings, "subagent", input.prompt);
    const parsed = extractJson<Partial<GeneratedSubagentDraft>>(raw);
    return normalizeSubagentDraft(parsed as GeneratedSubagentDraft, fallback);
  } catch (error) {
    if (settings.mode === "api") {
      throw error;
    }
    return fallback;
  }
}

export function applyProviderPreset(provider: AiSettings["provider"]) {
  if (provider === "custom") {
    return { baseUrl: "", model: "" };
  }
  return aiProviderDefaults[provider];
}

export function coerceSkillDraft(value: GeneratedSkillDraft, skills: Skill[]) {
  return {
    ...value,
    tags: value.tags ?? inferTags(value.description),
    frontmatter: {
      ...value.frontmatter,
      tools: value.frontmatter.tools?.length ? value.frontmatter.tools : ["Read", "Grep", "Glob"],
      skills: value.frontmatter.skills?.length ? value.frontmatter.skills : skills.slice(0, 2).map((skill) => skill.name),
      permissions: value.frontmatter.permissions?.length ? value.frontmatter.permissions : ["read-only"],
    },
  };
}

export function coerceSubagentDraft(value: GeneratedSubagentDraft) {
  return {
    ...value,
    usageExamples: value.usageExamples?.length ? value.usageExamples : parseList(`@${value.name} handle this task`),
    allowedTools: value.allowedTools?.length ? value.allowedTools : ["Read", "Glob", "Grep"],
  };
}
