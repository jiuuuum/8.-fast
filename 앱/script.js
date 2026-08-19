// ===== 상수 =====
const STORAGE_KEY = "todos";
const THEME_KEY = "theme";
const CATEGORIES = ["전체", "업무", "개인", "공부"];

// ===== DOM 요소 =====
const todoInputEl = document.getElementById("todo-input");
const categorySelectEl = document.getElementById("category-select");
const addBtnEl = document.getElementById("add-btn");
const todoListEl = document.getElementById("todo-list");
const emptyMessageEl = document.getElementById("empty-message");
const progressTextEl = document.getElementById("progress-text");
const remainingBadgeEl = document.getElementById("remaining-badge");
const themeToggleEl = document.getElementById("theme-toggle");
const searchInputEl = document.getElementById("search-input");
const filterTabsEl = document.getElementById("filter-tabs");
const clearCompletedBtnEl = document.getElementById("clear-completed-btn");

// ===== 상태 =====
let todos = [];
let searchQuery = "";
let activeFilter = "전체";

// ===== 저장/로드 함수 =====
function saveTodos(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ===== 렌더링 함수 =====
function getVisibleTodos() {
  const query = searchQuery.trim().toLowerCase();
  return todos.filter((todo) => {
    const matchesFilter = activeFilter === "전체" || todo.category === activeFilter;
    const matchesQuery = !query || todo.text.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });
}

function renderTodos(visibleList) {
  todoListEl.innerHTML = "";

  const isEmpty = visibleList.length === 0;
  emptyMessageEl.style.display = isEmpty ? "block" : "none";
  if (isEmpty) {
    emptyMessageEl.textContent =
      todos.length === 0 ? "할 일이 없습니다. 추가해보세요!" : "검색 결과가 없습니다.";
  }

  visibleList.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    if (todo.completed) text.classList.add("completed");

    const category = document.createElement("span");
    category.className = "todo-category";
    category.dataset.category = todo.category;
    category.textContent = todo.category;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "수정";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "삭제";

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(category);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    todoListEl.appendChild(li);
  });
}

function renderProgress(list) {
  const total = list.length;
  const completed = list.filter((todo) => todo.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressTextEl.textContent = `완료 ${completed} / ${total} (${percent}%)`;
}

function renderRemainingBadge(list) {
  const remaining = list.filter((todo) => !todo.completed).length;
  remainingBadgeEl.textContent = `남은 ${remaining}개`;
}

function renderClearCompletedState(list) {
  clearCompletedBtnEl.disabled = !list.some((todo) => todo.completed);
}

function renderAll() {
  renderTodos(getVisibleTodos());
  renderProgress(todos);
  renderRemainingBadge(todos);
  renderClearCompletedState(todos);
}

// ===== 데이터 조작 함수 =====
function addTodo(text, category) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  todos.push({
    id: generateId(),
    text: trimmed,
    category,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos(todos);
  renderAll();
  return true;
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos(todos);
  renderAll();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos(todos);
  renderAll();
}

function editTodoText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    renderAll();
    return;
  }
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.text = trimmed;
  saveTodos(todos);
  renderAll();
}

function clearCompletedTodos() {
  const completedCount = todos.filter((todo) => todo.completed).length;
  if (completedCount === 0) return;

  const confirmed = window.confirm(`완료된 항목 ${completedCount}개를 모두 삭제하시겠습니까?`);
  if (!confirmed) return;

  todos = todos.filter((todo) => !todo.completed);
  saveTodos(todos);
  renderAll();
}

// ===== 테마 =====
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleEl.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  saveTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

// ===== 필터 =====
function setActiveFilter(filter) {
  if (!CATEGORIES.includes(filter)) return;
  activeFilter = filter;
  Array.from(filterTabsEl.children).forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderAll();
}

// ===== 이벤트 핸들러 =====
function handleAddClick() {
  const added = addTodo(todoInputEl.value, categorySelectEl.value);
  if (added) {
    todoInputEl.value = "";
  }
  todoInputEl.focus();
}

function handleInputKeydown(e) {
  if (e.key === "Enter") {
    handleAddClick();
  }
}

function startEdit(li, id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const textEl = li.querySelector(".todo-text");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo-edit-input";
  input.value = todo.text;
  li.replaceChild(input, textEl);
  input.focus();
  input.select();

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    if (save) {
      editTodoText(id, input.value);
    } else {
      renderAll();
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    else if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
}

function handleListClick(e) {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  } else if (e.target.classList.contains("edit-btn")) {
    startEdit(li, id);
  }
}

function handleListChange(e) {
  if (!e.target.classList.contains("todo-checkbox")) return;
  const li = e.target.closest(".todo-item");
  if (!li) return;
  toggleTodo(li.dataset.id);
}

function handleSearchInput(e) {
  searchQuery = e.target.value;
  renderTodos(getVisibleTodos());
}

function handleFilterClick(e) {
  const btn = e.target.closest(".filter-tab");
  if (!btn) return;
  setActiveFilter(btn.dataset.filter);
}

function handleGlobalKeydown(e) {
  if (!e.altKey) return;

  const filterByCode = {
    Digit1: "전체",
    Digit2: "업무",
    Digit3: "개인",
    Digit4: "공부",
  };

  if (e.code === "KeyN") {
    e.preventDefault();
    todoInputEl.focus();
  } else if (e.code === "KeyD") {
    e.preventDefault();
    toggleTheme();
  } else if (filterByCode[e.code]) {
    e.preventDefault();
    setActiveFilter(filterByCode[e.code]);
  }
}

// ===== 초기화 =====
function init() {
  todos = loadTodos();
  applyTheme(loadTheme());
  renderAll();

  addBtnEl.addEventListener("click", handleAddClick);
  todoInputEl.addEventListener("keydown", handleInputKeydown);
  todoListEl.addEventListener("click", handleListClick);
  todoListEl.addEventListener("change", handleListChange);
  clearCompletedBtnEl.addEventListener("click", clearCompletedTodos);
  searchInputEl.addEventListener("input", handleSearchInput);
  filterTabsEl.addEventListener("click", handleFilterClick);
  themeToggleEl.addEventListener("click", toggleTheme);
  document.addEventListener("keydown", handleGlobalKeydown);
}

document.addEventListener("DOMContentLoaded", init);
