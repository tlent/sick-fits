require("dotenv").config();
const cookieParser = require("cookie-parser");
const JWT = require("jsonwebtoken");
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

server.express.use(cookieParser());

server.express.use((request, response, next) => {
  const { token } = request.cookies;
  if (token) {
    const { userID } = JWT.verify(token, process.env.APP_SECRET);
    request.userID = userID;
  }
  next();
});

server.start(
  { cors: { credentials: true, origin: process.env.FRONTEND_URL } },
  opts => {
    console.log(`Server is running on http://localhost:${opts.port}`);
  }
);
