export const toolOptions = [
  "Read",
  "Write",
  "Bash",
  "Glob",
  "Grep",
  "Skill",
  "Edit",
  "Task",
  "WebFetch",
  "TodoWrite",
  "Question",
];

export const modelOptions = [
  "sonnet-4",
  "haiku",
  "opus",
  "gpt-4.1",
  "gpt-4o",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "o4-mini",
];

export const permissionOptions = ["read-only", "write", "git", "planning", "analysis", "docs", "network"];

export const projectGradients = [
  "from-violet-500 to-cyan-500",
  "from-fuchsia-500 to-indigo-500",
  "from-emerald-500 to-cyan-500",
  "from-amber-500 to-rose-500",
  "from-sky-500 to-violet-500",
];

export const aiProviderDefaults = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-7-sonnet-latest",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-3.7-sonnet",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-large-latest",
  },
  xai: {
    baseUrl: "https://api.x.ai/v1",
    model: "grok-3-beta",
  },
  together: {
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
  },
  fireworks: {
    baseUrl: "https://api.fireworks.ai/inference/v1",
    model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
  },
  perplexity: {
    baseUrl: "https://api.perplexity.ai",
    model: "sonar-pro",
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.1:8b",
  },
  cerebras: {
    baseUrl: "https://api.cerebras.ai/v1",
    model: "llama-3.3-70b",
  },
  sambanova: {
    baseUrl: "https://api.sambanova.ai/v1",
    model: "Meta-Llama-3.3-70B-Instruct",
  },
  hyperbolic: {
    baseUrl: "https://api.hyperbolic.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  },
  moonshot: {
    baseUrl: "https://api.moonshot.ai/v1",
    model: "kimi-k2-0905-preview",
  },
  nebius: {
    baseUrl: "https://api.studio.nebius.com/v1",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
  },
  custom: {
    baseUrl: "",
    model: "",
  },
} as const;

export const aiProviderLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
  gemini: "Gemini",
  groq: "Groq",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  xai: "xAI",
  together: "Together AI",
  fireworks: "Fireworks AI",
  perplexity: "Perplexity",
  ollama: "Ollama",
  cerebras: "Cerebras",
  sambanova: "SambaNova",
  hyperbolic: "Hyperbolic",
  moonshot: "Moonshot AI",
  nebius: "Nebius AI Studio",
  custom: "Custom (OpenAI-compatible)",
} as const;
