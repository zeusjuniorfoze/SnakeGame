// js/game.js
class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.speed = 0; // ms par frame, ajusté par difficulté
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.mode = "classic";
    this.difficulty = "medium";
    this.tempInfinite = false;
    this.interval = null;
    this.snake = new Snake(this);
    this.food = new Food(this);
    this.obstacles = []; // Pour mode survival
    this.audio = {
      eat: new Audio("audio/eat.mp3"),
      gameOver: new Audio("audio/game-over.mp3"),
      background: new Audio("audio/background.mp3"),
    };
    this.audio.background.loop = true;

    // Adapter canvas à l'écran
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    initControls(this);
    initUI(this);

    // Chargement stats
    this.stats = loadFromLocal("stats", { games: 0, time: 0 });

    // PWA service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }

  resizeCanvas() {
    this.canvas.width =
      Math.floor(window.innerWidth / this.gridSize) * this.gridSize;
    this.canvas.height =
      Math.floor((window.innerHeight * 0.7) / this.gridSize) * this.gridSize; // 70% hauteur pour HUD
  }

  start() {
    this.stats.games++;
    saveToLocal("stats", this.stats);
    this.adjustDifficulty();
    if (localStorage.getItem("sound") !== "off") this.audio.background.play();
    this.interval = setInterval(() => this.loop(), this.speed);
  }
  adjustDifficulty() {
    switch (this.difficulty) {
      case "easy":
        this.speed = 3;
        break; // 300 ms → lent
      case "medium":
        this.speed = 5;
        break; // 200 ms → normal
      case "hard":
        this.speed = 10;
        break; // 120 ms → rapide
      case "expert":
        this.speed = 15;
        break; // 80 ms → très rapide
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.snake.update();
    this.food.draw(this.ctx);
    this.snake.draw(this.ctx);

    // Collision nourriture
    if (this.snake.x === this.food.x && this.snake.y === this.food.y) {
      this.snake.maxCells++;
      this.score += this.food.isPowerUp && this.food.type === 1 ? 20 : 10;
      if (localStorage.getItem("sound") !== "off") this.audio.eat.play();
      vibrate();
      if (this.food.isPowerUp) this.food.applyPowerUp(this.food.type);
      this.food.reset();
      updateHUD(this);

      // Progression niveau
      if (this.score % 50 === 0) this.level++;
      if (this.score >= 100) unlockAchievement("Pro Player");
    }

    // Obstacles en mode survival
    if (this.mode === "survival") {
      this.obstacles.forEach((obs) => {
        // Dessin et mouvement
      });
      // Ajouter aléatoirement
      if (Math.random() < 0.01)
        this.obstacles.push({
          /* ... */
        });
    }

    // Mode contre-la-montre
    if (this.mode === "timed") {
      // Gérer timer 2 min
    }
  }

  loseLife() {
    this.lives--;
    vibrate(200);
    updateHUD(this);
    if (this.lives <= 0) this.gameOver();
    else this.resetSnake();
  }

  resetSnake() {
    this.snake = new Snake(this);
  }

  gameOver() {
    clearInterval(this.interval);
    this.audio.background.pause();
    if (localStorage.getItem("sound") !== "off") this.audio.gameOver.play();
    document.getElementById(
      "final-score"
    ).textContent = `Score final: ${this.score}`;
    const highScores = loadFromLocal("highScores", []);
    if (this.score > Math.min(...highScores) || highScores.length < 10) {
      highScores.push(this.score);
      saveToLocal("highScores", highScores);
      document.getElementById("new-record").classList.remove("hidden");
    }
    showScreen("game-over");
  }

  pause() {
    clearInterval(this.interval);
    this.audio.background.pause();
  }

  resume() {
    this.interval = setInterval(() => this.loop(), this.speed);
    if (localStorage.getItem("sound") !== "off") this.audio.background.play();
  }

  restart() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.snake = new Snake(this);
    this.food.reset();
    this.obstacles = [];
    showScreen("game-screen");
    this.start();
  }
}

const game = new Game();
showScreen("home-screen");
