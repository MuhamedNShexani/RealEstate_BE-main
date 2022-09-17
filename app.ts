import * as express from "express";
import * as bodyParser from "body-parser";
import errorMiddleware from "./middleware/error.middleware";
const { Server } = require("socket.io");
import * as Cors from 'cors'
import * as http from "http";

class App {
  public app: express.Application;
  public port: number;
  public server;
  public io;

  constructor(controllers, port) {
    this.app = express();
    this.app.use(Cors())
    this.port = port;
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    this.io.on("connection", function (socket) {
      console.log("new User Connected");
      console.log("userId:  " + socket.id);
      socket.on('join', function (room) {
        console.log("room", room);

        socket.join(room);
      });
      // socket.on("join", (data) => {

      //   console.log("resultData: ",data);
      //   socket.join("Ahmed11");

      // })  
      socket.on("Add", (params, callback) => {
        console.log(params);
        socket.join(params);
        // callback({
        //   status: "ok"
        // });
      })

      socket.on("disconnect", (reason) => {
        console.log(socket.id + "  " + reason)
      })
    });

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }
  // app.use(function (req, res, next) {
  //   // Website you wish to allow to connect
  //   res.setHeader("Access-Control-Allow-Origin", "*");

  //   // Request methods you wish to allow
  //   res.setHeader(
  //     "Access-Control-Allow-Methods",
  //     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  //   );

  //   // Request headers you wish to allow
  //   res.setHeader(
  //     "Access-Control-Allow-Headers",
  //     "X-Requested-With,content-type"
  //   );

  //   // Set to true if you need the website to include cookies in the requests sent
  //   // to the API (e.g. in case you use sessions)
  //   res.setHeader("Access-Control-Allow-Credentials", true);

  //   // Pass to next layer of middleware
  //   next();
  // });
  private initializeMiddlewares() {
    var fileupload = require("express-fileupload");
    this.app.use(fileupload({
      limits: {
        fileSize: 10000000, // Around 10MB
      },
      abortOnLimit: true,
    })
    );
    this.app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
      next();
    });
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers) {

    controllers.forEach((controller) => {
      // this.io.sockets.on('connection', controller.router);
      controller.io = this.io;
      this.app.use("/", controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
