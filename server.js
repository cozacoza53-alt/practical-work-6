import express from 'express';
import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const taskSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Назва завдання обов’язкова',
            'string.min': 'Назва завдання повинна містити мінімум 3 символи',
            'string.max': 'Назва завдання повинна містити максимум 100 символів',
            'any.required': 'Назва завдання обов’язкова',
            'string.base': 'Назва завдання повинна бути рядком'
        })
});

let tasks = [
    { id: 1, title: 'Вивчити Node.js', completed: false },
    { id: 2, title: 'Вивчити Express.js', completed: true },
    { id: 3, title: 'Виконати практичну роботу №5', completed: false }
];

let nextId = 4;

app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { error, value } = taskSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            details: error.details
        });
    }

    const newTask = {
        id: nextId++,
        title: value.title.trim(),
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'Завдання успішно додано',
        task: newTask
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: 'Завдання не знайдено'
        });
    }

    task.completed = !task.completed;

    res.status(200).json({
        message: 'Статус завдання успішно змінено',
        task: task
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: 'Завдання не знайдено'
        });
    }

    tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: 'Завдання успішно видалено'
    });
});

app.get('/tasks', (req, res) => {
    res.render('tasks', { tasks });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
