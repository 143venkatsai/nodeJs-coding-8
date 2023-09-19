const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${erroe.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get Todos API 1

const hasPropertyAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery = "";
  switch (true) {
    // Scenario 1
    case hasPropertyAndStatusProperty(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo 
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND priority = '${priority}';`;
      break;

    // Scenario 2
    case hasPriorityProperty(request.query):
      getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;

    // Scenario 3
    case hasStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
          todo LIKE '%${search_q}%' 
          AND status = '${status}';`;
      break;

    // Scenario 4
    default:
      getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
          todo LIKE '%${search_q}%';`;
      break;
  }

  const getTodos = await db.all(getTodosQuery);
  response.send(getTodos);
});

//Get Todo API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
      SELECT 
        * 
      FROM 
        todo 
      WHERE 
        id = ${todoId};`;
  const getTodo = await db.get(getTodoQuery);
  response.send(getTodo);
});

//Add Todo API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
      INSERT INTO todo(id,todo,priority,status) 
      VALUES (${id},'${todo}','${priority}','${status}');`;
  const postTodo = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo API 4

const hasUpdateStatusProperty = (requestBody) => {
  return requestBody.status !== undefined;
};

const hasUpdatePriorityProperty = (requestBody) => {
  return requestBody.priority !== undefined;
};

const hasUpdateTodoProperty = (requestBody) => {
  return request.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let update = "";
  switch (true) {
    // Scenario 1
    case requestBody.status !== undefined:
      update = "Status";
      break;
    // Scenario 2
    case requestBody.priority !== undefined:
      update = "Priority";
      break;
    // Scenario 3
    case requestBody.todo !== undefined:
      update = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`;
  const previous = await db.get(previousTodoQuery);
  const {
    todo = previous.todo,
    priority = previous.priority,
    status = previous.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE todo 
    SET 
      todo = '${todo}',
      priority = '${priority}',
      status = '${status}'
    WHERE 
      id = ${todoId};`;
  const updateTodo = await db.run(updateTodoQuery);
  response.send(`${update} Updated`);
});

//Delete todo API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
      DELETE FROM 
        todo 
      WHERE 
        id = ${todoId};`;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
