// ===== 상수 =====
const STORAGE_KEY = "todos";

// ===== DOM 요소 =====
const todoListEl = document.getElementById("todo-list");
const emptyMessageEl = document.getElementById("empty-message");
const progressTextEl = document.getElementById("progress-text");

// ===== 저장/로드 함수 =====
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
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

// ===== 렌더링 함수 =====
function renderTodos(todos) {
  todoListEl.innerHTML = "";

  const isEmpty = todos.length === 0;
  emptyMessageEl.style.display = isEmpty ? "block" : "none";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    if (todo.completed) text.style.textDecoration = "line-through";

    const category = document.createElement("span");
    category.className = "todo-category";
    category.textContent = todo.category;

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(category);
    todoListEl.appendChild(li);
  });
}

function renderProgress(todos) {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressTextEl.textContent = `완료 ${completed} / ${total} (${percent}%)`;
}

// ===== 초기화 =====
function init() {
  const todos = loadTodos();
  renderTodos(todos);
  renderProgress(todos);
}

document.addEventListener("DOMContentLoaded", init);
