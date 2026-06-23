// --- DOM Elements ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filtersContainer = document.getElementById('filters');

// --- State Management ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// --- Core Functions ---
function renderTasks() {
  taskList.innerHTML = '';
  
  let filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; 
  });

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id; 

    li.innerHTML = `
      <div class="task-content" style="width: 100%;">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text" style="flex: 1;">${task.text}</span>
      </div>
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <span class="badge ${task.priority}">${task.priority}</span>
        <button class="edit-btn" aria-label="Edit">✎</button>
        <button class="delete-btn" aria-label="Delete">&times;</button>
      </div>
    `;
    
    taskList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(e) {
  e.preventDefault(); 
  
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(), 
    text: text,
    completed: false,
    priority: priorityInput.value
  };

  tasks.unshift(newTask); 
  saveTasks();
  renderTasks();
  
  taskInput.value = ''; 
}

// --- Event Listeners ---
taskForm.addEventListener('submit', addTask);

// Event Delegation for the entire list
taskList.addEventListener('click', (e) => {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;
  
  const taskId = taskItem.dataset.id;

  // 1. Delete (D in CRUD)
  if (e.target.classList.contains('delete-btn')) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
  }

  // 2. Toggle Complete
  if (e.target.classList.contains('task-checkbox')) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  // 3. Edit (U in CRUD)
  if (e.target.classList.contains('edit-btn')) {
    const task = tasks.find(t => t.id === taskId);
    const textContainer = taskItem.querySelector('.task-text');
    
    // Prevent multiple inputs
    if (textContainer.querySelector('input')) return;

    // Create the input field
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = task.text;
    editInput.className = 'edit-input';

    // Replace text with input
    textContainer.innerHTML = '';
    textContainer.appendChild(editInput);
    editInput.focus();

    // Logic to save the edits
    const saveEdit = () => {
      const newText = editInput.value.trim();
      if (newText) {
        task.text = newText; 
        saveTasks();         
      }
      renderTasks();         
    };

    // Listen for blur (clicking away) or Enter key
    editInput.addEventListener('blur', saveEdit);
    editInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        saveEdit();
      }
    });
  }
});

// Handle Filter Selection
filtersContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    renderTasks();
  }
});

// Initial Render
renderTasks();