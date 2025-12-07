// Elementos del DOM
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Cargar tareas guardadas al iniciar
document.addEventListener("DOMContentLoaded", renderTasks);

// Eventos
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });

// ------------------------------
// Funciones
// ------------------------------
function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };

    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    taskInput.value = "";
    renderTasks();
}

function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");
    li.setAttribute("data-id", task.id);

    li.innerHTML = `
        <div class="task-left">
            <button class="complete-btn" title="Marcar completada"></button>
            <span class="task-text">${escapeHtml(task.text)}</span>
        </div>
        <div class="btn-group">
            <button class="up-btn" title="Subir prioridad">▲</button>
            <button class="down-btn" title="Bajar prioridad">▼</button>
            <button class="edit-btn" title="Editar">Editar</button>
            <button class="delete-btn" title="Eliminar">Eliminar</button>
        </div>
    `;

    // Complete toggle
    li.querySelector(".complete-btn").addEventListener("click", () => {
        toggleComplete(task.id);
    });

    // Delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
        deleteTask(task.id);
        renderTasks();
    });

    // Edit
    li.querySelector(".edit-btn").addEventListener("click", () => {
        startEditing(task.id, li);
    });

    // Move up/down
    li.querySelector(".up-btn").addEventListener("click", () => {
        moveTask(task.id, -1);
    });
    li.querySelector(".down-btn").addEventListener("click", () => {
        moveTask(task.id, 1);
    });

    taskList.appendChild(li);
}

function toggleComplete(id) {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function startEditing(id, li) {
    const textSpan = li.querySelector('.task-text');
    const original = textSpan.textContent;

    // Replace span with input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = original;
    input.className = 'edit-input';
    textSpan.replaceWith(input);

    // Replace edit button with save/cancel
    const editBtn = li.querySelector('.edit-btn');
    editBtn.style.display = 'none';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar';
    saveBtn.className = 'save-btn';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'cancel-btn';

    editBtn.parentNode.insertBefore(saveBtn, editBtn);
    editBtn.parentNode.insertBefore(cancelBtn, editBtn);

    input.focus();

    saveBtn.addEventListener('click', () => {
        const newText = input.value.trim();
        if (newText === '') return;
        updateTaskText(id, newText);
        renderTasks();
    });

    cancelBtn.addEventListener('click', () => {
        renderTasks();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveBtn.click();
        if (e.key === 'Escape') cancelBtn.click();
    });
}

function updateTaskText(id, newText) {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.text = newText;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function moveTask(id, direction) {
    const tasks = getTasks();
    const idx = tasks.findIndex(x => x.id === id);
    if (idx === -1) return;
    const newIndex = idx + direction;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    const [item] = tasks.splice(idx, 1);
    tasks.splice(newIndex, 0, item);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function renderTasks() {
    taskList.innerHTML = '';
    const tasks = getTasks();
    tasks.forEach(t => addTaskToDOM(t));
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/\"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
