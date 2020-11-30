//initializing the express 'sketch' object
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//initialize the HTTP server
let http = require("http");
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("server is listening at port: " + port);
});

//initialize socket.io
// let io = require('socket.io').listen(server);
let io = require("socket.io")();
io.listen(server);

//different nameSpaces
let mod = io.of("/mod");
let user = io.of("/user");

let frequencies = [];

//listening for users to connect
mod.on("connection", (socket) => {
  console.log("mod socket connected : " + socket.id);

  socket.on("freqData", (data) => {
    // console.log(data.freq);

    user.emit("freqData", data);
  });

  //   socket.on("modFreq", (data) => {

  //     frequencies.push(data);

  //     mod.emit("modFreq", frequencies);
  //   });
});

let names = [];

//listening for users to connect
user.on("connection", (socket) => {
  console.log("mod socket connected : " + socket.id);

  //getting bat sound
  socket.on("animalSounds", (data) => {
    console.log(data.sound.file);
    let dataSound = data.sound.file;

    user.emit("dataSound", dataSound);
  });
  //getting username and score
  socket.on("clientObject", (data) => {
    //sending name and score back to nameSpace '/freq2'
    names.push(data);
    console.log(names);

    socket.emit("names", names);
    // mod.emit("scoreBoard", scoreBoard);
  });
});
