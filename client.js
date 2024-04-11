const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");

const packageDef = protoLoader.loadSync("./todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

const client = new todoPackage.Todo(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// client.createTodo(
//   {
//     text: "Do the study.",
//   },
//   (err, response) => {
//     console.log(JSON.stringify(response, 0, 0, null));
//   }
// );
// client.readTodos({}, (err, response) => {
//   console.log(JSON.stringify(response.todos, 0, 0, null));
// });

const call = client.readTodosStream();

call.on("data", (item) => {
  console.log("recieved from server: ", item);
});

call.on("end", (e) => console.log("Server done!"));
