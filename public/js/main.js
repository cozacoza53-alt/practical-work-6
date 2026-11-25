const notyf = new Notyf({
    duration: 3000,
    position: {
        x: 'right',
        y: 'top'
    }
});

const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskList = document.getElementById('taskList');

function createTaskElement(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    const title = document.createElement('span');
    title.className = 'task-title';

    const status = document.createElement('strong');
    status.className = 'task-status';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'toggle-btn';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Видалити';

    li.appendChild(title);
    li.appendChild(status);
    li.appendChild(toggleButton);
    li.appendChild(deleteButton);

    updateTaskElement(li, task);

    return li;
}
function updateTaskElement(li, task) {
    const title = li.querySelector('.task-title');
    const status = li.querySelector('.task-status');
    const toggleButton = li.querySelector('.toggle-btn');

    title.textContent = task.title;

    if (task.completed) {
        title.style.textDecoration = 'line-through';
        title.style.color = 'green';
        status.textContent = ' — Виконано';
        toggleButton.textContent = 'Скасувати';
    } else {
        title.style.textDecoration = 'none';
        title.style.color = '';
        status.textContent = ' — Не виконано';
        toggleButton.textContent = 'Виконати';
    }
}

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = taskTitle.value.trim();

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        const data = await response.json();

        if (!response.ok) {
            notyf.error(data.message || 'Помилка під час додавання задачі');
            return;
        }

        const task = data.task;

        taskList.appendChild(createTaskElement(task));
        taskForm.reset();

        notyf.success(data.message);
    } catch (error) {
        notyf.error('Не вдалося з’єднатися із сервером');
    }
});

taskList.addEventListener('click', async (event) => {
    const li = event.target.closest('li');
    if (!li) return;

    const id = li.dataset.id;

    if (event.target.classList.contains('toggle-btn')) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT'
            });

            const data = await response.json();

            if (!response.ok) {
                notyf.error(data.message || 'Не вдалося змінити статус');
                return;
            }

            updateTaskElement(li, data.task);
            notyf.success(data.message);
        } catch (error) {
            notyf.error('Помилка з’єднання із сервером');
        }
    }

    if (event.target.classList.contains('delete-btn')) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                notyf.error(data.message || 'Не вдалося видалити задачу');
                return;
            }

            li.remove();
            notyf.success(data.message);
        } catch (error) {
            notyf.error('Помилка з’єднання із сервером');
        }
    }
});