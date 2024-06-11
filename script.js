class TodoItemFormatter {
  formatTask(task) { return task.length > 14 ? task.slice(0, 14) + "..." : task; }
  formatDueDate(dueDate) { return dueDate || "No due date"; }
  formatStatus(completed) { return completed ? "Completed" : "Pending"; }
}

class TodoManager {
  constructor(formatter) {
      this.todos = JSON.parse(localStorage.getItem("todos")) || [];
      this.formatter = formatter;
  }

  addTodo(task, dueDate) {
      const newTodo = {
          id: this.getRandomId(),
          task: this.formatter.formatTask(task),
          dueDate: this.formatter.formatDueDate(dueDate),
          completed: false
      };
      this.todos.push(newTodo);
      this.save();
      return newTodo;
  }

  editTodo(id, updatedTask) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
          todo.task = updatedTask;
          this.save();
      }
      return todo;
  }

  deleteTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== id);
      this.save();
  }

  toggleStatus(id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
          todo.completed = !todo.completed;
          this.save();
      }
  }

  clearAll() {
      this.todos = [];
      this.save();
  }

  filterTodos(status) {
      switch (status) {
          case "pending": return this.todos.filter(todo => !todo.completed);
          case "completed": return this.todos.filter(todo => todo.completed);
          default: return this.todos;
      }
  }

  getRandomId() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  save() {
      localStorage.setItem("todos", JSON.stringify(this.todos));
  }
}

class UIManager {
  constructor(manager, formatter) {
      this.manager = manager;
      this.formatter = formatter;
      this.init();
  }

  init() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
  }

  cacheDOM() {
      this.taskInput = document.querySelector("#todo-input");
      this.dateInput = document.querySelector("#todo-date");
      this.addBtn = document.querySelector(".add-task-button");
      this.todosListBody = document.querySelector(".todos-list-body");
      this.alertMessage = document.querySelector(".alert-message");
      this.deleteAllBtn = document.querySelector(".delete-all-btn");
  }

  bindEvents() {
      this.addBtn.addEventListener("click", () => this.addTodo());
      this.taskInput.addEventListener("keyup", e => {
          if (e.key === "Enter" && this.taskInput.value) this.addTodo();
      });
      this.deleteAllBtn.addEventListener("click", () => this.clearAllTodos());
      document.querySelectorAll(".todos-filter li a").forEach(button => {
          button.addEventListener("click", (e) => {
              e.preventDefault();
              this.filterTodos(button.textContent.toLowerCase());
          });
      });
  }

  addTodo() {
      const task = this.taskInput.value;
      const dueDate = this.dateInput.value;
      if (!task) {
          this.showAlert("Please enter a task", "error");
          return;
      }
      this.manager.addTodo(task, dueDate);
      this.render();
      this.taskInput.value = "";
      this.dateInput.value = "";
      this.showAlert("Task added successfully", "success");
  }

  clearAllTodos() {
      this.manager.clearAll();
      this.render();
      this.showAlert("All todos cleared successfully", "success");
  }

  filterTodos(status) {
      this.render(this.manager.filterTodos(status));
  }

  render(todos = this.manager.filterTodos("all")) {
      this.todosListBody.innerHTML = todos.length ? todos.map(todo => `
          <tr class="todo-item" data-id="${todo.id}">
              <td>${this.formatter.formatTask(todo.task)}</td>
              <td>${this.formatter.formatDueDate(todo.dueDate)}</td>
              <td>${this.formatter.formatStatus(todo.completed)}</td>
              <td>
                  <button class="btn btn-warning btn-sm" onclick="uiManager.editTodo('${todo.id}')"><i class="bx bx-edit-alt bx-xs"></i></button>
                  <button class="btn btn-success btn-sm" onclick="uiManager.toggleStatus('${todo.id}')"><i class="bx bx-check bx-xs"></i></button>
                  <button class="btn btn-error btn-sm" onclick="uiManager.deleteTodo('${todo.id}')"><i class="bx bx-trash bx-xs"></i></button>
              </td>
          </tr>
      `).join('') : '<tr><td colspan="5" class="text-center">No task found</td></tr>';
  }

  editTodo(id) {
      const todo = this.manager.todos.find(t => t.id === id);
      if (todo) {
          this.taskInput.value = todo.task;
          this.manager.deleteTodo(id);
          this.addBtn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
          this.addBtn.addEventListener("click", () => this.updateTodo(), { once: true });
      }
  }

  updateTodo() {
      this.addBtn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
      this.showAlert("Todo updated successfully", "success");
      this.render();
  }

  toggleStatus(id) {
      this.manager.toggleStatus(id);
      this.render();
  }

  deleteTodo(id) {
      this.manager.deleteTodo(id);
      this.showAlert("Todo deleted successfully", "success");
      this.render();
  }

  showAlert(message, type) {
      this.alertMessage.innerHTML = `<div class="alert alert-${type} shadow-lg mb-5 w-full"><div><span>${message}</span></div></div>`;
      this.alertMessage.classList.remove("hide");
      this.alertMessage.classList.add("show");
      setTimeout(() => {
          this.alertMessage.classList.remove("show");
          this.alertMessage.classList.add("hide");
      }, 3000);
  }
}

class ThemeSwitcher {
  constructor(themes, html) {
      this.themes = themes;
      this.html = html;
      this.init();
  }

  init() {
      const theme = localStorage.getItem("theme");
      if (theme) this.setTheme(theme);
      this.bindEvents();
  }

  bindEvents() {
      this.themes.forEach(theme => {
          theme.addEventListener("click", (e) => {
              e.preventDefault();
              const themeName = theme.getAttribute("data-theme");
              this.setTheme(themeName);
              localStorage.setItem("theme", themeName);
          });
      });
  }

  setTheme(themeName) {
      this.html.setAttribute("data-theme", themeName);
  }
}

const formatter = new TodoItemFormatter();
const manager = new TodoManager(formatter);
const uiManager = new UIManager(manager, formatter);
const themeSwitcher = new ThemeSwitcher(document.querySelectorAll(".theme-item"), document.querySelector("html"));
