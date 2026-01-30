// Get DOM elements
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const filterBtns = document.querySelectorAll(".filter-btn");
const todoCount = document.getElementById("todoCount");
const clearCompletedBtn = document.getElementById("clearCompleted");

// Todo array
let todos = [];
let currentFilter = "all";

// Load todos from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTodos();
  renderTodos();
});

// Add todo event listeners
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Filter event listeners
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Clear completed event listener
clearCompletedBtn.addEventListener("click", clearCompleted);

// Add new todo
function addTodo() {
  const text = todoInput.value.trim();

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  todoInput.value = "";
  saveTodos();
  renderTodos();
}

// Toggle todo completion
function toggleTodo(id) {
  todos = todos.map(
    todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)
  );
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

// Clear completed todos
function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  renderTodos();
}

// Get filtered todos
function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter(todo => !todo.completed);
    case "completed":
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

// Render todos to the DOM
function renderTodos() {
  const filteredTodos = getFilteredTodos();

  // Clear the list
  todoList.innerHTML = "";

  // Show empty state if no todos
  if (filteredTodos.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
            <span>📋</span>
            <p>${currentFilter === "completed"
              ? "No completed tasks"
              : currentFilter === "active"
                ? "No active tasks"
                : "No tasks yet. Add one above!"}</p>
        `;
    todoList.appendChild(emptyState);
  } else {
    // Render each todo
    filteredTodos.forEach(todo => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;
      li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? "checked" : ""}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            `;
      todoList.appendChild(li);
    });
  }

  // Update count
  updateCount();
}

// Update task count
function updateCount() {
  const activeTodos = todos.filter(todo => !todo.completed).length;
  todoCount.textContent = `${activeTodos} task${activeTodos !== 1
    ? "s"
    : ""} remaining`;
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodos() {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
