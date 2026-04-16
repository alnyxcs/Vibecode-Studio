# VibeCode Studio

<p align="center">
  <img src="https://img.shields.io/badge/Vite-6.0.5-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

<p align="center">
  <b>EN</b> · <a href="#-руководство">RU</a>
</p>

VibeCode Studio — это веб-приложение для создания, организации, тестирования и экспорта AI-ассистентов и инструкций для OpenCode и Claude Code.

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

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

### How to Use

1. **Create a Skill** — Go to Skills tab, click "New Skill", write your instruction
2. **Create a Subagent** — Go to Subagents tab, create an assistant, optionally link skills
3. **Organize** — Use Projects to separate assets by client or repository
4. **Export** — Click Export tab, choose platform (OpenCode/Claude Code/Both), download ZIP
5. **Use** — Unzip into your project root, launch your coding agent

### Export Structure

```
my-project/
├── .opencode/          # For OpenCode
│   ├── skills/
│   │   └── reviewer/SKILL.md
│   └── agents/
│       └── reviewer.md
│
├── .claude/            # For Claude Code
│   ├── skills/
│   │   └── reviewer/SKILL.md
│   └── agents/
│       └── reviewer.md
```

### Tech Stack

- **Vite** — Build tool
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Radix UI** — Accessible primitives
- **Zustand** — State management
- **react-hook-form + Zod** — Form handling
- **JSZip** — ZIP generation

### Building for Production

```bash
npm run build
```

The output will be in the `dist/` folder — ready to deploy to any static host.

---

## 🇷🇺 Руководство

### Что такое VibeCode Studio?

VibeCode Studio — это веб-приложение для создания **скиллов** (переиспользуемых инструкций) и **сабагентов** (специализированных AI-ассистентов) для кодовых агентов вроде OpenCode и Claude Code.

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

### Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Откройте URL из терминала (обычно `http://localhost:5173`).

### Как использовать

1. **Создайте скилл** — Перейдите на вкладку Skills, нажмите "New Skill", напишите инструкцию
2. **Создайте сабагента** — Перейдите на вкладку Subagents, создайте ассистента, опционально привяжите скиллы
3. **Организуйте** — Используйте Projects для разделения ассетов по клиентам или репозиториям
4. **Экспортируйте** — Нажмите на вкладку Export, выберите платформу (OpenCode/Claude Code/Обе), скачайте ZIP
5. **Используйте** — Распакуйте в корень проекта, запустите кодового агента

### Структура экспорта

```
my-project/
├── .opencode/          # Для OpenCode
│   ├── skills/
│   │   └── reviewer/SKILL.md
│   └── agents/
│       └── reviewer.md
│
├── .claude/            # Для Claude Code
│   ├── skills/
│   │   └── reviewer/SKILL.md
│   └── agents/
│       └── reviewer.md
```

### Основные разделы приложения

- **Главная** — Обзор, гайд, быстрые ссылки
- **Дашборд** — Статистика, недавние изменения
- **Скиллы** — Создание и редактирование инструкций
- **Сабагенты** — Создание специализированных ассистентов
- **Проекты** — Управление рабочими пространствами
- **Экспорт** — Скачивание ZIP, копирование JSON, импорт
- **Документация** — Справка и форматы

### Сборка для продакшена

```bash
npm run build
```

Результат будет в папке `dist/` — готово к деплою на любой статический хостинг.

---

## 📝 License

MIT
