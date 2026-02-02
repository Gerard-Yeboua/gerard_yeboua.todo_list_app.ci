// ========== DOM Elements ==========
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const viewTitle = document.getElementById('viewTitle');
const viewDate = document.getElementById('viewDate');

// Navigation
const navItems = document.querySelectorAll('.nav-item');

// Lists
const addListBtn = document.getElementById('addListBtn');
const customLists = document.getElementById('customLists');
const listModal = document.getElementById('listModal');
const listNameInput = document.getElementById('listNameInput');
const createListBtn = document.getElementById('createListBtn');
const cancelListBtn = document.getElementById('cancelListBtn');

// Task Options
const taskOptions = document.getElementById('taskOptions');
const setDateBtn = document.getElementById('setDateBtn');
const setImportantBtn = document.getElementById('setImportantBtn');
const listSelect = document.getElementById('listSelect');

// Date Picker
const datePicker = document.getElementById('datePicker');
const dueDateInput = document.getElementById('dueDateInput');
const confirmDate = document.getElementById('confirmDate');
const cancelDate = document.getElementById('cancelDate');

// ========== Data ==========
let todos = [];
let lists = [];
let currentView = 'my-day';
let currentList = null;
let tempTaskData = {
    dueDate: null,
    important: false,
    listId: null
};

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateViewDate();
    renderLists();
    renderTodos();
    updateAllCounts();
});

// ========== Event Listeners ==========

// Add todo
addBtn.addEventListener('click', showTaskOptions);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        showTaskOptions();
    }
});

todoInput.addEventListener('focus', () => {
    if (todoInput.value.trim()) {
        taskOptions.style.display = 'block';
    }
});

todoInput.addEventListener('input', () => {
    if (todoInput.value.trim()) {
        taskOptions.style.display = 'block';
    } else {
        taskOptions.style.display = 'none';
    }
});

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.list-item').forEach(list => list.classList.remove('active'));
        item.classList.add('active');
        currentView = item.dataset.view;
        currentList = null;
        updateViewTitle();
        renderTodos();
    });
});

// Lists
addListBtn.addEventListener('click', openListModal);
createListBtn.addEventListener('click', createList);
cancelListBtn.addEventListener('click', closeListModal);

listNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createList();
    }
});

// Task options
setDateBtn.addEventListener('click', () => {
    datePicker.style.display = 'flex';
    dueDateInput.valueAsDate = new Date();
});

setImportantBtn.addEventListener('click', () => {
    tempTaskData.important = !tempTaskData.important;
    setImportantBtn.classList.toggle('active');
});

listSelect.addEventListener('change', (e) => {
    tempTaskData.listId = e.target.value || null;
});

// Date picker
confirmDate.addEventListener('click', () => {
    tempTaskData.dueDate = dueDateInput.value;
    datePicker.style.display = 'none';
    setDateBtn.textContent = `📅 ${formatDateShort(dueDateInput.value)}`;
});

cancelDate.addEventListener('click', () => {
    datePicker.style.display = 'none';
    tempTaskData.dueDate = null;
    setDateBtn.innerHTML = '<span>📅</span> Date d\'échéance';
});

// ========== Functions ==========

function showTaskOptions() {
    const text = todoInput.value.trim();
    if (!text) {
        alert('Veuillez entrer une tâche !');
        return;
    }

    // Show options or add directly
    if (taskOptions.style.display === 'block') {
        addTodo();
    } else {
        taskOptions.style.display = 'block';
    }
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        important: tempTaskData.important,
        dueDate: tempTaskData.dueDate,
        listId: tempTaskData.listId,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    
    // Reset
    todoInput.value = '';
    taskOptions.style.display = 'none';
    resetTempTaskData();
    
    saveData();
    renderTodos();
    updateAllCounts();
}

function resetTempTaskData() {
    tempTaskData = {
        dueDate: null,
        important: false,
        listId: null
    };
    setImportantBtn.classList.remove('active');
    setDateBtn.innerHTML = '<span>📅</span> Date d\'échéance';
    listSelect.value = '';
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveData();
    renderTodos();
    updateAllCounts();
}

function toggleImportant(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, important: !todo.important } : todo
    );
    saveData();
    renderTodos();
    updateAllCounts();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveData();
    renderTodos();
    updateAllCounts();
}

function getFilteredTodos() {
    const today = new Date().toISOString().split('T')[0];
    
    switch (currentView) {
        case 'my-day':
            return todos.filter(todo => !todo.completed && todo.dueDate === today);
        case 'important':
            return todos.filter(todo => !todo.completed && todo.important);
        case 'planned':
            return todos.filter(todo => !todo.completed && todo.dueDate);
        case 'all':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            if (currentList) {
                return todos.filter(todo => todo.listId === currentList && !todo.completed);
            }
            return todos;
    }
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        const messages = {
            'my-day': '☀️<p>Aucune tâche pour aujourd\'hui</p>',
            'important': '⭐<p>Aucune tâche importante</p>',
            'planned': '📅<p>Aucune tâche planifiée</p>',
            'all': '📋<p>Aucune tâche. Ajoutez-en une !</p>',
            'completed': '✓<p>Aucune tâche terminée</p>'
        };
        emptyState.innerHTML = `<span>${messages[currentView] || messages['all']}</span>`;
        todoList.appendChild(emptyState);
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const listName = todo.listId ? lists.find(l => l.id === todo.listId)?.name : null;
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = todo.dueDate && todo.dueDate < today && !todo.completed;
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        ${todo.dueDate ? `<span class="todo-date ${isOverdue ? 'overdue' : ''}">📅 ${formatDate(todo.dueDate)}</span>` : ''}
                        ${listName ? `<span class="todo-list-name">📁 ${escapeHtml(listName)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="star-btn ${todo.important ? 'active' : ''}" onclick="toggleImportant(${todo.id})" title="Important">
                        ${todo.important ? '⭐' : '☆'}
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">Supprimer</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    updateTaskCount();
}

function updateTaskCount() {
    const activeTodos = getFilteredTodos().filter(t => !t.completed).length;
    todoCount.textContent = `${activeTodos} tâche${activeTodos > 1 ? 's' : ''}`;
}

function updateAllCounts() {
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('todayCount').textContent = 
        todos.filter(t => !t.completed && t.dueDate === today).length;
    
    document.getElementById('importantCount').textContent = 
        todos.filter(t => !t.completed && t.important).length;
    
    document.getElementById('plannedCount').textContent = 
        todos.filter(t => !t.completed && t.dueDate).length;
    
    document.getElementById('allCount').textContent = 
        todos.filter(t => !t.completed).length;
    
    document.getElementById('completedCount').textContent = 
        todos.filter(t => t.completed).length;

    // Update list counts
    lists.forEach(list => {
        const count = todos.filter(t => !t.completed && t.listId === list.id).length;
        const countEl = document.querySelector(`.list-item[data-list-id="${list.id}"] .count`);
        if (countEl) {
            countEl.textContent = count;
        }
    });
}

function updateViewTitle() {
    const titles = {
        'my-day': 'Ma journée',
        'important': 'Important',
        'planned': 'Planifié',
        'all': 'Toutes',
        'completed': 'Terminées'
    };
    viewTitle.textContent = titles[currentView] || 'Mes Tâches';
}

function updateViewDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('fr-FR', options);
    viewDate.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

// ========== Lists Management ==========

function openListModal() {
    listModal.style.display = 'flex';
    listNameInput.value = '';
    listNameInput.focus();
}

function closeListModal() {
    listModal.style.display = 'none';
}

function createList() {
    const name = listNameInput.value.trim();
    if (!name) {
        alert('Veuillez entrer un nom de liste !');
        return;
    }

    const list = {
        id: Date.now(),
        name: name,
        icon: '📁'
    };

    lists.push(list);
    saveData();
    renderLists();
    updateListSelect();
    closeListModal();
}

function deleteList(id) {
    if (!confirm('Supprimer cette liste ? Les tâches seront conservées.')) return;
    
    lists = lists.filter(list => list.id !== id);
    todos = todos.map(todo => 
        todo.listId === id ? { ...todo, listId: null } : todo
    );
    
    if (currentList === id) {
        currentView = 'all';
        currentList = null;
        navItems[3].click(); // Click on "Toutes"
    }
    
    saveData();
    renderLists();
    updateListSelect();
    renderTodos();
    updateAllCounts();
}

function selectList(id) {
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));
    
    const listItem = document.querySelector(`.list-item[data-list-id="${id}"]`);
    if (listItem) {
        listItem.classList.add('active');
    }
    
    currentView = 'list';
    currentList = id;
    const list = lists.find(l => l.id === id);
    viewTitle.textContent = list ? list.name : 'Liste';
    renderTodos();
}

function renderLists() {
    customLists.innerHTML = '';
    
    lists.forEach(list => {
        const count = todos.filter(t => !t.completed && t.listId === list.id).length;
        
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.listId = list.id;
        div.innerHTML = `
            <span class="list-icon">${list.icon}</span>
            <span class="list-name">${escapeHtml(list.name)}</span>
            <span class="count">${count}</span>
            <button class="delete-list-btn" onclick="deleteList(${list.id})">🗑️</button>
        `;
        
        div.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-list-btn')) {
                selectList(list.id);
            }
        });
        
        customLists.appendChild(div);
    });
    
    updateListSelect();
}

function updateListSelect() {
    listSelect.innerHTML = '<option value="">Aucune liste</option>';
    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        listSelect.appendChild(option);
    });
}

// ========== Utilities ==========

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    if (dateOnly === todayOnly) return 'Aujourd\'hui';
    if (dateOnly === tomorrowOnly) return 'Demain';
    
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== Data Persistence ==========

function saveData() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('lists', JSON.stringify(lists));
}

function loadData() {
    const storedTodos = localStorage.getItem('todos');
    const storedLists = localStorage.getItem('lists');
    
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
    
    if (storedLists) {
        lists = JSON.parse(storedLists);
    }
}