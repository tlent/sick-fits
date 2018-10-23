const cookieParser = require("cookie-parser");
require("dotenv").config();
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

server.express.use(cookieParser());

server.start(
  { cors: { credentials: true, origin: process.env.FRONTEND_URL } },
  opts => {
    console.log(`Server is running on http://localhost:${opts.port}`);
  }
);
