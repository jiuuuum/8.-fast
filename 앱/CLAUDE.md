# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A personal to-do list web app built with plain HTML/CSS/JavaScript — no frameworks, no build tools, no package manager. The app is opened directly in a browser (open `index.html`); there is no dev server, bundler, linter, or test suite to run.

## Files

- `index.html` — markup: header (title + dark-mode toggle), input row (text + category + add), progress row (progress text + remaining badge), toolbar (search input + category filter tabs + "완료된 항목 모두 삭제" button), `#todo-list` container, `#empty-message` empty/no-results text
- `style.css` — card-based UI on CSS custom properties (`--color-*` tokens defined on `:root`, overridden under `:root[data-theme="dark"]`) so light/dark theming doesn't require duplicating rules; includes a `max-width: 480px` responsive breakpoint with touch-sized controls
- `script.js` — all application logic

## Architecture

All logic lives in `script.js`, organized by role: storage (`saveTodos`/`loadTodos`/`saveTheme`/`loadTheme`), rendering (`renderTodos`/`renderProgress`/`renderRemainingBadge`/`renderClearCompletedState`/`renderAll`), data mutation (`addTodo`/`deleteTodo`/`toggleTodo`/`editTodoText`/`clearCompletedTodos`), theme (`applyTheme`/`toggleTheme`), filtering (`setActiveFilter`/`getVisibleTodos`), and event handlers (add/edit/delete/toggle/search/filter/theme/keyboard shortcuts).

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

Search and category-filter state (`searchQuery`, `activeFilter`) are display-only — `getVisibleTodos()` derives the filtered view from `todos` on every render. Progress, remaining-count badge, and the "clear completed" button's enabled state always reflect the *full* `todos` array, not the filtered view — only the rendered list itself is filtered.

Theme is applied via `data-theme="light"|"dark"` on `<html>`, driven purely by CSS variables — there are no separate dark-mode style blocks to keep in sync manually. Persisted to `localStorage` under `"theme"`.

Key invariants to preserve when touching this app:
- Every add/edit/delete/toggle/clear-completed must immediately call `saveTodos()` so state survives a page refresh.
- Empty or whitespace-only text must never be added as a todo (input is left untouched, not silently cleared, so the user can see nothing happened).
- `#empty-message` shows one of two texts depending on cause: "할 일이 없습니다. 추가해보세요!" when `todos` itself is empty, vs "검색 결과가 없습니다." when `todos` is non-empty but the search/filter yields nothing.
- Progress display format is `완료 N / 전체 M (X%)`, recalculated on every mutation, and must show `0%` (not `NaN%`) when there are 0 todos.
- Categories (업무/개인/공부) each get a consistent color/badge, with separate light/dark variants defined via `:root[data-theme="dark"] .todo-category[data-category="..."]` overrides.
- "완료된 항목 모두 삭제" always confirms via `window.confirm()` before deleting, and is disabled (not just inert) when there are no completed items.
- Keyboard shortcuts (Alt+N focus input, Alt+D toggle theme, Alt+1–4 switch category filter) are bound on `document` using `e.code` (physical key), not `e.key`, to stay layout-independent — note Alt+D can be intercepted by the browser chrome itself (e.g. address-bar focus) and isn't fully preventable from page JS.

## Development plan

This project was built in staged steps, recorded as prompts in `0819.ㅡㅇ/1.md` through `6..md`:
1. Static markup scaffold (no logic)
2. `localStorage` persistence layer (`saveTodos`/`loadTodos`), no UI wiring yet
3. Wire UI to storage: add / edit / delete / completion toggle, all persisted immediately
4. Category color badges + live-updating progress display
5. Polish pass 1: responsive/mobile layout, edge-case verification, refactor into render/storage/event-handler sections
6. Dark mode (CSS-variable theming, persisted, animated), search + category filter tabs, "완료된 항목 모두 삭제" with confirm, remaining-count badge, differentiated empty-state text, Alt-key shortcuts, touch-friendly mobile sizing

When asked to continue this project, check which of these are already reflected in `script.js`/`style.css` before assuming a step still needs to be done — prompt files can be edited/reused in place (e.g. `6..md`'s content has already changed once from a duplicate of step 1 to the actual step-6 spec above), so always re-read the prompt file rather than trusting a cached summary of it.
