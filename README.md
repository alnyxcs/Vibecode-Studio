# VibeCode Studio

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.10-FF7F50?style=for-the-badge&logo=tauri" alt="Tauri">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

<p align="center">
  <b>EN</b> · <a href="#-руководство">RU</a>
</p>

VibeCode Studio — это десктопное приложение для создания, организации, тестирования и экспорта AI-ассистентов и инструкций для OpenCode и Claude Code.

---

## 🚀 Download

Download the installer from the [Releases](https://github.com/your-repo/releases) page:
- **Windows**: `.exe` or `.msi` installer
- **macOS**: `.dmg` installer
- **Linux**: `.AppImage` or `.deb`

---

## 📖 English Guide

### What is VibeCode Studio?

VibeCode Studio helps you build **skills** (reusable instructions) and **subagents** (specialized AI assistants) for coding agents like OpenCode and Claude Code.

Think of it as a visual IDE for prompt engineering — instead of writing markdown files by hand, you get a beautiful UI with:
- Frontmatter editing (model, tools, temperature, context)
- Subagent hierarchy management
- Project workspaces (global vs project-scoped assets)
- One-click export to `.opencode/` and `.claude/` directories

### Key Concepts

| Term | Description |
|------|-------------|
| **Skill** | A reusable instruction saved as `SKILL.md` with YAML frontmatter. Example: "Code Reviewer", "Bug Investigator" |
| **Subagent** | A specialized AI assistant you call with `@mention`. Has a role prompt, tool list, and can preload skills |
| **Project** | A workspace that scopes skills and subagents to one client/team/repository |
| **Export** | Downloads a ZIP with the correct directory structure ready for your coding agent |

### Development

```bash
# Install dependencies
npm install

# Start development
npm run tauri:dev
```

### Build

```bash
npm run tauri:build
```

### Tech Stack

- **Tauri 2** — Desktop framework
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling

---

## 🇷🇺 Руководство

### Что такое VibeCode Studio?

VibeCode Studio — это десктопное приложение для создания **скиллов** (переиспользуемых инструкций) и **сабагентов** (специализированных AI-ассистентов) для кодовых агентов вроде OpenCode и Claude Code.

Это как визуальная IDE для промпт-инженеринга — вместо ручного написания markdown-файлов вы получаете красивый UI с:
- Редактирование frontmatter (model, tools, temperature, context)
- Управление иерархией сабагентов
- Рабочие пространства проектов (глобальные vs проектные ассеты)
- Один клик для экспорта в директории `.opencode/` и `.claude/`

### Ключевые понятия

| Термин | Описание |
|--------|----------|
| **Скилл** | Переиспользуемая инструкция в виде `SKILL.md` с YAML frontmatter. Пример: "Ревью кода", "Поиск багов" |
| **Сабагент** | Специализированный AI-помощник, вызываемый через `@mention`. Имеет role prompt, список инструментов, может использовать скиллы |
| **Проект** | Рабочее пространство, которое ограничивает скиллы и сабагенты для одного клиента/команды/репозитория |
| **Экспорт** | Скачивание ZIP с правильной структурой директорий для вашего кодового агента |

### Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run tauri:dev
```

### Сборка

```bash
npm run tauri:build
```

---

## 📝 License

MIT