# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A personal to-do list web app built with plain HTML/CSS/JavaScript — no frameworks, no build tools, no package manager. The app is opened directly in a browser (open `index.html`); there is no dev server, bundler, linter, or test suite to run.

## Files

- `index.html` — markup only (input + category select + add button, progress display, `#todo-list` container, `#empty-message` empty-state text)
- `style.css` — bright/clean card-based UI, centered layout
- `script.js` — all application logic

## Architecture

All logic lives in `script.js` and is organized by role:
- **storage functions** — `saveTodos()` / `loadTodos()` persist the todo array to `localStorage` under the key `"todos"` as JSON
- **render functions** — rebuild `#todo-list` from the in-memory todo array and toggle `#empty-message` visibility when the list is empty
- **event handlers** — wire up add (button click / Enter key), edit, delete, and completion-toggle interactions

Data model for a single todo item:
```
{
  id: string,        // unique, timestamp-based
  text: string,
  category: "업무" | "개인" | "공부",
  completed: boolean,
  createdAt: number   // timestamp
}
```

Key invariants to preserve when touching this app:
- Every add/edit/delete/toggle must immediately call `saveTodos()` so state survives a page refresh.
- Empty or whitespace-only text must never be added as a todo.
- The empty-state message (`#empty-message`) is shown only when the todo list is empty, otherwise hidden.
- Progress display format is `완료 N / 전체 M (X%)`, recalculated on every add/delete/toggle, and must show `0%` (not `NaN%`) when there are 0 todos.
- Categories (업무/개인/공부) each get a consistent color/badge in the list — keep color assignments stable across edits.

## Development plan

This project was built in staged steps, recorded as prompts in `0819.ㅡㅇ/1.md` through `5.md`:
1. Static markup scaffold (no logic)
2. `localStorage` persistence layer (`saveTodos`/`loadTodos`), no UI wiring yet
3. Wire UI to storage: add / edit / delete / completion toggle, all persisted immediately
4. Category color badges + live-updating progress display
5. Final polish: responsive/mobile layout, edge-case verification (empty input, refresh persistence, delete persistence, progress recalculation, list scrolling with 10–20+ items), and refactoring `script.js` into clearly separated render/storage/event-handler functions

When asked to continue this project, check which of these steps are already reflected in `script.js` before assuming a step still needs to be done.
