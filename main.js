const express = require("express");
const bodyParser = require("body-parser");
const pg = require('pg');

const config = {
  user: 'database_os32_user',
  database: 'database_os32',
  password: 'e75nqxHcLSHynRcneCOXyXNkq93RZEzI',
  host: 'dpg-cerq3fg2i3miim7su2r0-a.oregon-postgres.render.com',
  port: 5432,
  ssl: true,
  max: 10,
  idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config);

// Modelo
class TodoModel {
  constructor() {
    this.todos = [];
  }

  async getTodos(todoText) {
    const res = await pool.query('SELECT * FROM todos');
    const data = res.rows;
    const json_data = JSON.stringify(data);
    console.log(json_data);
    return data;  
  }

  async addTodo(todoText) {
    const query = 'INSERT INTO todos(task) VALUES($1) RETURNING *';
    const values = [todoText];
    const res = await pool.query(query, values);
    return res;
  }

  editTodo(index, todoText) {
    this.todos[index].text = todoText;
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
  }

  toggleTodo(index) {
    this.todos[index].completed = !this.todos[index].completed;
  }
}

// Controlador
class TodoController {
  constructor(model) {
    this.model = model;
  }

  async getTodos() {
    return await this.model.getTodos();
  }

  async addTodo(todoText) {
    this.model.addTodo(todoText);
  }

  editTodo(index, todoText) {
    this.model.editTodo(index, todoText);
  }

  deleteTodo(index) {
    this.model.deleteTodo(index);
  }

  toggleTodo(index) {
    this.model.toggleTodo(index);
  }
}

// Vistas (Rutas)
const app = express();
const todoModel = new TodoModel();
const todoController = new TodoController(todoModel);

app.use(bodyParser.json());

app.get("/todos", async (req, res) => {
  res.json(await todoController.getTodos());
});

// Vistas (Rutas) (continuación)
app.post("/todos",async (req, res) => {
  const todoText = req.body.text;
  todoController.addTodo(todoText);
  res.sendStatus(200);
});

app.put("/todos/:index", (req, res) => {
  const index = req.params.index;
  const todoText = req.body.text;
  todoController.editTodo(index, todoText);
  res.sendStatus(200);
});

app.delete("/todos/:index", (req, res) => {
  const index = req.params.index;
  todoController.deleteTodo(index);
  res.sendStatus(200);
});

app.patch("/todos/:index", (req, res) => {
  const index = req.params.index;
  todoController.toggleTodo(index);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
