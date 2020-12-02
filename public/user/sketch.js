const { Tone } = require("./tone");

var audio = [];
audio[0] = new Audio("../audio/bat1.mp3");
audio[1] = new Audio("../audio/bat2.mp3");
audio[2] = new Audio("../audio/bat3.mp3");
audio[3] = new Audio("../audio/bat4.mp3");
audio[4] = new Audio("../audio/bat5.mp3");
audio[5] = new Audio("../audio/bat6.mp3");
audio[6] = new Audio("../audio/bat7.mp3");


console.log(audio);

let divX;
let divY;
let oldIsPressed = false;
let isPressed = false;
let oldnoteoctave = "";
let ellipseWidthMin = 15;
let ellipseWidthMax = 150;
let ellipseWidth = ellipseWidthMin;



//create a socket namespace
let socket = io("/user");
let modSocket = io("/mod");

socket.on("connect", () => {
  console.log("connected");
});

modSocket.on("connect", () => {
  console.log("mod socket in user is connected");
});

//global socket variables
let score;
let receivedSound;
let clientName;
let clientDate;
let playing, clicked;
let p5playing;
let nameInput;
let sendButton;
let curName;
let toggleButton;
let hearClicked;

//variables for the Instructions window
let modal = document.getElementById("info-modal");
let infoButton = document.getElementById("info-button");
//span that closes the window
let span = document.getElementsByClassName("close")[0];

window.addEventListener("load", () => {
  //instructions window
  infoButton.onclick = function () {
    modal.style.display = "block";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  //start the oscillators
  toggleButton = document.getElementById("play-button");
  toggleButton.addEventListener("click", () => {
    playing = !playing;

    // if (playing) {
    //   osc1.start();
    //   osc2.start(1);
    //   toggleButton.style.background = "green";
    //   toggleButton.innerHTML = "On";
    // } else {
    //   osc1.stop();
    //   osc2.stop();
    //   toggleButton.innerHTML = "Off";
    //   toggleButton.style.background = "red";
    // }
  });

  nameInput = document.getElementById("uname");
  sendButton = document.getElementById("send-name");

  sendButton.addEventListener("click", () => {
    curName = nameInput.value;
    let msgObj = { name: curName };
    socket.emit("msg", msgObj);
  });

  //ScoreButton receives the scoreboard data from the server
  let hearButton = document.getElementById("hear-button");
  let receivedSound;
  let receivedMsg;
  let msgEl;

  hearButton.addEventListener("click", () => {
    hearClicked = true;
    msgEl = document.createElement("p");
    msgEl.innerHTML = "";
    //sends the score data to the server first
    let clientObject = {
      name: curName,
      date: clientDate,
    };
    socket.emit("clientObject", clientObject);

    //listening for bat sound to come from server
    socket.on("dataSound", (data) => {
      console.log(data);
      receivedSound = data;
    });

    //listen for data from the server
    socket.on("scoreBoard", (data) => {
      // let scoreBoardBox = document.getElementById("score");
      // for (let i = 0; i < data.length; i++) {
      //   receivedMsg = data[i].name + ": " + data[i].score;
      //   msgEl.innerHTML = receivedMsg;
      //   //add this element to the page
      //   scoreBoardBox.appendChild(msgEl);
      // }
    });
  });
});

let bat1;
let bat2;
let bat3;

// global variables for p5 Sketch
let cnv;
let mouseFreq;
let analyzer, waveform, freqAnalyzer, waveFreq;
let x, y;

function preload() {
  // soundFormats("mp3");
  bat1 = loadSound("../Audio/bat1.mp3");
  bat2 = loadSound("../Audio/bat2.mp3");
  bat3 = loadSound("../Audio/bat3.mp3");
}

function setup() {

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas = createCanvas(width, height);
  divX = width / audio.length;
  // divY = height / octaves.length;
  for (i = 0; i < 8; i++) {
    line(0, divY * i, width, divY * i);
    line(divX * i, 0, divX * i, height);
  }
  synth = new Tone.Player("audio").toDestination();
  colorMode(HSB, 255);

  //listen for freq data from the modulator page
  socket.on("freqData", (data) => {
    // console.log(data.freq);
    // freq1 = data.freq;
    // osc1.freq(freq1);
    // freq2 = freq1 * random(0.9, 1.1);
    // osc2.freq(freq2);
  });

  cnv = createCanvas(windowWidth, windowHeight);

  // cnv.mousePressed(playOscillator);
  background(0);

  analyzer = new p5.FFT();
  bat1.amp(0.3, 0.5);

  freqAnalyzer = new p5.FFT();
}

function draw() {
  if (Audio.context.state != 'running') {
    audio.start();
  }

  if (isPressed) {

    let audio = Math.round((mouseX + (divX / 2)) / divX) - 1
    // let octave = Math.round((mouseY + (divY / 2)) / divY) - 1;
    fill(colores[note], 127, 100);

    if (ellipseWidth < ellipseWidthMax) {
      ellipseWidth++;
    }

    ellipse(mouseX, mouseY, ellipseWidth, ellipseWidth);

    let newnoteoctave = notes[note] + octaves[octave];

    if (oldnoteoctave != newnoteoctave) {
      oldnoteoctave = newnoteoctave;
      synth.triggerRelease();
      synth.triggerAttack(newnoteoctave);
    }

  } else {

    if (oldIsPressed) {
      oldnoteoctave = "";
      ellipseWidth = ellipseWidthMin;
      synth.triggerRelease();
    }
  }

  oldIsPressed = isPressed;
}

function touchStarted() {
  isPressed = true;
}

function touchEnded() {
  isPressed = false;
}

function mousePressed() {
  isPressed = true;
}

function mouseReleased() {
  isPressed = false;




  if (hearClicked == true) {
    waveform = analyzer.waveform();
    waveFreq = freqAnalyzer.analyze();

    for (let i = 0; i < waveform.length; i++) {
      let angle = map(i, 0, waveform.length, 0, 360);
      let amp = waveform[i];
      let r = map(amp, 0, 128, 100, 5);
      let x = r * cos(angle);
      let y = r * sin(angle);
      // let x = map(i, 0, waveform.length, 0, width);
      // let y = map(waveform[i], -1, 1, 0, height);
      // let radius = map(amp, 0, 0.5, 300, 5);
      fill(255, 100, r, r);
      // vertex(x, y);
      ellipse(windowWidth / 3 + x, windowHeight / 2 + y, r);
    }
  }
}
function freqFromMouse() {
  // return map(mouseX, 0, width - 1, freq2 * 0.9, freq2 * 1.1);
}

function mouseMoved(event) {
  //send the sound to the mod page
  // let modFreq = {
  //   osc1: osc1,
  //   osc2: osc2,
  // };
  // modSocket.emit("modFreq", modFreq);
  // waveform = analyzer.waveform();
  // noStroke();
  // beginShape();
  // for (let i = 0; i < waveform.length; i += 10) {
  //   let x = map(i, 0, waveform.length - 1, 0, windowWidth);
  //   var y = map(waveform[i], -0.5, 0.5, 0, windowHeight);
  //   let col = map(waveform[i], -1, 1, 0, 255);
  //   // stroke(0, 0, i);
  //   noStroke();
  //   // noFill();
  //   vertex(x, y);
  //   fill(255, col, 100, col);
  // }
  // endShape();
}

function mouseClicked() {
  clicked = !clicked;

  //send sound to server
  let animalSounds = {
    sound: bat1,
  };

  console.log(animalSounds.sound.file);
  socket.emit("animalSounds", animalSounds);

  bat1.play();

  waveform = analyzer.waveform();
  waveFreq = freqAnalyzer.analyze();

  for (let i = 0; i < waveform.length; i++) {
    let angle = map(i, 0, waveform.length, 0, 360);
    let amp = waveform[i];
    let r = map(amp, 0, 128, 100, 5);
    let x = r * cos(angle);
    let y = r * sin(angle);
    // let x = map(i, 0, waveform.length, 0, width);
    // let y = map(waveform[i], -1, 1, 0, height);
    // let radius = map(amp, 0, 0.5, 300, 5);
    fill(255, r);
    // vertex(x, y);
    ellipse(windowWidth / 2 + x, windowHeight / 2 + y, r);
  }

  // draw the shape of the waveform
  push();
  beginShape();
  strokeWeight(5);
  noFill();
  for (let i = 0; i < waveFreq.length; i++) {
    let angle = map(i, 0, waveFreq.length, 0, 360);
    let amp = waveFreq[i];
    let r = map(amp, 0, 128, 0, 400);
    let x = r * cos(angle);
    let y = r * sin(angle);
    let col = map(i, 0, waveFreq.length, 0, 255);

    // stroke(200, 255, i);
    if (amp != 0) {
      stroke(constrain(col, 100, 255), random(255), 155);
      line(width / 2, height / 2, x, y);
      vertex(x, y + height / 2);
      vertex(x + width / 2, y);
    }
  }
  endShape();
  pop();
}

function keyPressed() {
  if (keyCode === 32) {
    playing = !playing;

    if (playing) {
      osc1.start();
      osc2.start(1);
      toggleButton.style.background = "green";
      toggleButton.innerHTML = "On";
    } else {
      osc1.stop();
      osc2.stop();
      toggleButton.innerHTML = "Off";
      toggleButton.style.background = "red";
    }
  }
}




