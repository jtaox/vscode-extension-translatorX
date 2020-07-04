function Speak() {
  this.audio = document.querySelector("#speakAudio");
  this.addListener();
}

Speak.prototype.play = function(url) {
  let audio = new Audio();
  audio.src = url;
  setTimeout(() => {
    audio.play();
  }, 200);
};

Speak.prototype.stop = function() {
  audio.pause();
  audio.currentTime = 0;
};

Speak.prototype.addListener = function() {
  // addEventListener
};

function SpeakControler() {
  this.commandMap = new Map();
}

SpeakControler.prototype.register = function(cmd, fun) {
  this.commandMap.set(cmd, fun);
};

SpeakControler.prototype.execute = function(action) {
  const { command, args } = action;
  if (this.commandMap.has(command)) {
    this.commandMap.get(command)(args);
  }
};

const speak = new Speak();
const speakControler = new SpeakControler();

speakControler.register("play", ({ url }) => speak.play(url));

window.addEventListener("message", event => {
  const message = event.data;
  const { command, args } = message;
  console.log(JSON.stringify(message), "message");
  speakControler.execute({
    command,
    args
  });
});
