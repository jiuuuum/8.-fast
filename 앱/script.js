// ===== 상수 =====
const STORAGE_KEY = "todos";

// ===== DOM 요소 =====
const todoInputEl = document.getElementById("todo-input");
const categorySelectEl = document.getElementById("category-select");
const addBtnEl = document.getElementById("add-btn");
const todoListEl = document.getElementById("todo-list");
const emptyMessageEl = document.getElementById("empty-message");
const progressTextEl = document.getElementById("progress-text");

// ===== 상태 =====
let todos = [];

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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ===== 렌더링 함수 =====
function renderTodos(list) {
  todoListEl.innerHTML = "";

  const isEmpty = list.length === 0;
  emptyMessageEl.style.display = isEmpty ? "block" : "none";

  list.forEach((todo) => {
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

function renderAll() {
  renderTodos(todos);
  renderProgress(todos);
}

// ===== 데이터 조작 함수 =====
function addTodo(text, category) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.push({
    id: generateId(),
    text: trimmed,
    category,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos(todos);
  renderAll();
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

// ===== 이벤트 핸들러 =====
function handleAddClick() {
  addTodo(todoInputEl.value, categorySelectEl.value);
  todoInputEl.value = "";
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

// ===== 초기화 =====
function init() {
  todos = loadTodos();
  renderAll();

  addBtnEl.addEventListener("click", handleAddClick);
  todoInputEl.addEventListener("keydown", handleInputKeydown);
  todoListEl.addEventListener("click", handleListClick);
  todoListEl.addEventListener("change", handleListChange);
}

document.addEventListener("DOMContentLoaded", init);
