const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "usuario não encontrado!" });
  }

  request.user = user;

  return next();
}

function getTodoIndex(todoList, id, response) {
  let result = null;
  todoList.forEach((todo, index) => {
    if (todo.id === id) {
      result = index;
    }
  });
  if (result !== null) {
    return result;
  } else return response.status(404).json({ error: "Tarefa inexistente!" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();

  if (users.find((user) => user.username === username)) {
    return response.status(400).json({ error: "Username ja existe!" });
  }

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  const todoProcedure = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoProcedure);

  return response.status(201).json(todoProcedure);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const index = getTodoIndex(user.todos, id, response);

  if (!title || !deadline) {
    return response
      .status(404)
      .json({ error: "problema no corpo da requisição" });
  }

  user.todos[index].title = title;
  user.todos[index].deadline = new Date(deadline);

  return response.status(200).json(user.todos[index]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = getTodoIndex(user.todos, id, response);

  user.todos[index].done = true;

  return response.status(200).json(user.todos[index]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = getTodoIndex(user.todos, id, response);

  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;
