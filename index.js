const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");

const hostname = "localhost";
const port = 3000;

const mongoose = require("mongoose");

const Dishes = require("./models/dishes");
const Promotions = require("./models/promotions");
const Leaders = require("./models/leaders");

const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
  // console.log(req.headers)

  res.statusCode = 200;
  res.setHeader("Content-Type", " text/html");
  res.end("This is express server");
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
