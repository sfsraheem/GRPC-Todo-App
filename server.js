const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");

const packageDef = protoLoader.loadSync("./todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

const todos = {};

function createTodo(call, callback) {
  const todoId = uuidv4();
  const todo = { id: todoId, text: call.request.text };
  todos[todoId] = todo;
  callback(null, { id: todoId, text: todo.text });
}

function readTodos(call, callback) {
  const allTodos = Object.values(todos).map((todo) => ({
    id: todo.id,
    text: todo.text,
  }));
  callback(null, { todos: allTodos });
}

function readTodosStream(call, callback) {
  //   Object.values(todos).forEach((todo) => {
  //       call.write({ id: todo.id, text: todo.text });
  //   });
  //   call.end(); // Close the stream after sending all todos

  let index = 0;
  const todosArray = Object.values(todos);

  const sendTodo = () => {
    if (index < todosArray.length) {
      const todo = todosArray[index];
      call.write({ id: todo.id, text: todo.text });
      index++;
      setTimeout(sendTodo, 1000); // Call sendTodo again after 1 second
    } else {
      call.end(); // Close the stream after sending all todos
    }
  };

  sendTodo();
}

const server = new grpc.Server();
server.addService(todoPackage.Todo.service, {
  createTodo,
  readTodos,
  readTodosStream,
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error(error);
      return;
    }
    // server.start();
    console.log(`Server running on port ${port}`);
  }
);
