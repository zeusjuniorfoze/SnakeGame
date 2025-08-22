document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const powerUpIndicator = document.getElementById('power-up-indicator');
    const achievementToast = document.getElementById('achievement-toast');
    const achievementTitle = document.getElementById('achievement-title');
    const achievementDesc = document.getElementById('achievement-desc');
    const countdownElement = document.getElementById('countdown');
    const pauseButton = document.getElementById('pause-btn');
    const levelCompleteModal = document.getElementById('level-complete-modal');
    const completedLevelElement = document.getElementById('completed-level');
    const prizeAmountElement = document.getElementById('prize-amount');
    const nextLevelButton = document.getElementById('next-level-btn');
    const closeModalButton = document.getElementById('close-modal-btn');

    // Écrans
    const welcomeScreen = document.getElementById('welcome-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const settingsScreen = document.getElementById('settings-screen');
    const scoresScreen = document.getElementById('scores-screen');
    const statsScreen = document.getElementById('stats-screen');
    const aboutScreen = document.getElementById('about-screen');
    const tutorialScreen = document.getElementById('tutorial-screen');

    // Boutons
    const playBtn = document.getElementById('play-btn');
    const optionsBtn = document.getElementById('options-btn');
    const scoresBtn = document.getElementById('scores-btn');
    const statsBtn = document.getElementById('stats-btn');
    const aboutBtn = document.getElementById('about-btn');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const settingsPauseBtn = document.getElementById('settings-pause');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverMenuBtn = document.getElementById('game-over-menu-btn');
    const shareBtn = document.getElementById('share-btn');
    const backBtn = document.getElementById('back-btn');
    const backScores = document.getElementById('back-scores');
    const backStats = document.getElementById('back-stats');
    const backAbout = document.getElementById('back-about');
    const backTutorial = document.getElementById('back-tutorial');

    // Paramètres
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const swipeControlsCheckbox = document.getElementById('swipe-controls');
    const buttonControlsCheckbox = document.getElementById('button-controls');
    const soundEffectsCheckbox = document.getElementById('sound-effects');
    const backgroundMusicCheckbox = document.getElementById('background-music');

    // Boutons directionnels
    const upBtn = document.getElementById('up-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const downBtn = document.getElementById('down-btn');

    // Variables du jeu
    let gridSize = 20;
    let snake = [];
    let food = {};
    let obstacles = [];
    let powerUps = [];
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 5;
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let gameLoop;
    let activePowerUps = {};
    let cellSize;
    let canvasSize;
    let timedModeTimer = null;
    let obstacleInterval = null;
    let gameStartTime = 0;
    let totalTime = 0;
    let countdownActive = false;

    // Configuration
    let difficulty = 'easy';
    let gameMode = 'classic';
    let useSwipeControls = true;
    let showButtonControls = true;
    let useSoundEffects = false;
    let useBackgroundMusic = false;

    // Objectifs de niveau
    const levelTargets = {
        1: 100,
        2: 250,
        3: 500,
        4: 700,
        5: 1000
    };

    // Récompenses par niveau
    const levelRewards = {
        1: 500,
        2: 1000,
        3: 1500,
        4: 2000,
        5: 2500
    };

    // Audio - Désactivé
    const audio = {
        eat: { play: () => { } },
        gameOver: { play: () => { } },
        background: { play: () => { }, pause: () => { }, loop: true },
        powerUp: { play: () => { } },
        countdown: { play: () => { } },
        levelComplete: { play: () => { } }
    };

    // Statistiques et progression
    let stats = { games: 0, time: 0, bestScore: 0 };
    let highScores = [];
    let achievements = [];
    let skins = ['default'];

    // Liste des achievements
    const achievementList = [
        { id: 'firstWin', title: 'Premier repas', desc: 'Manger la première nourriture' },
        { id: 'level5', title: 'Expert', desc: 'Atteindre le niveau 5' },
        { id: 'highScore100', title: 'Pro Player', desc: 'Score de 100 points' },
        { id: 'survivalMaster', title: 'Survivant', desc: 'Survivre 2 min en mode survie' }
    ];

    // Fonctions utilitaires
    function loadFromLocal(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Erreur lors du chargement de ${key} depuis localStorage:`, e);
            return defaultValue;
        }
    }

    function saveToLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Erreur lors de l'enregistrement de ${key} dans localStorage:`, e);
        }
    }

    function vibrate(duration = 50) {
        if (navigator.vibrate) navigator.vibrate(duration);
    }

    function showAchievement(id) {
        const ach = achievementList.find(a => a.id === id);
        if (ach && !achievements.includes(id)) {
            achievements.push(id);
            saveToLocal('achievements', achievements);
            achievementTitle.textContent = ach.title;
            achievementDesc.textContent = ach.desc;
            achievementToast.classList.add('show');
            setTimeout(() => achievementToast.classList.remove('show'), 3000);
        }
    }

    function updateStatsScreen() {
        document.getElementById('games-played').textContent = `Parties jouées: ${stats.games}`;
        document.getElementById('total-time').textContent = `Temps total: ${Math.floor(stats.time / 60)} min`;
        document.getElementById('best-score').textContent = `Meilleur score: ${stats.bestScore}`;
    }

    function updateHighScores() {
        highScores.push(stats.bestScore);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 10);
        saveToLocal('highScores', highScores);
        const list = document.getElementById('high-scores');
        list.innerHTML = '';
        highScores.forEach((s, i) => {
            const li = document.createElement('li');
            li.textContent = `#${i + 1}: ${s}`;
            list.appendChild(li);
        });
    }

    function initCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth;
        canvasSize = Math.min(containerWidth, window.innerHeight * 0.7);
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        cellSize = canvasSize / gridSize;
    }

    function startCountdown(callback) {
        countdownActive = true;
        countdownElement.classList.remove('hidden');
        let count = 3;
        countdownElement.textContent = count;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
            } else {
                clearInterval(countdownInterval);
                countdownElement.textContent = "GO!";
                setTimeout(() => {
                    countdownElement.classList.add('hidden');
                    countdownActive = false;
                    callback();
                }, 500);
            }
        }, 1000);
    }

    function initGame() {
        stats.games++;
        gameStartTime = Date.now();
        saveToLocal('stats', stats);
        snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        lives = 3;
        level = 1;
        obstacles = [];
        powerUps = [];
        activePowerUps = {};
        gameSpeed = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : difficulty === 'hard' ? 9 : 12;
        updateUI();
        generateFood();
        hideAllScreens();
        startCountdown(() => {
            gameRunning = true;
            if (gameLoop) cancelAnimationFrame(gameLoop);
            gameLoop = requestAnimationFrame(update);
            if (gameMode === 'timed') {
                timedModeTimer = setTimeout(gameOver, 120000);
            }
            if (gameMode === 'survival') {
                obstacleInterval = setInterval(() => generateObstacles(1), 10000);
                setTimeout(() => {
                    if (gameRunning) showAchievement('survivalMaster');
                }, 120000);
            }
        });
    }

    function updateUI() {
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = level;
        updatePowerUpIndicators();
        document.querySelector('.directional-buttons').style.display = showButtonControls ? 'grid' : 'none';
    }

    function checkLevelCompletion() {
        if (levelTargets[level] && score >= levelTargets[level]) {
            score = levelTargets[level];
            scoreElement.textContent = score;
            gameRunning = false;
            cancelAnimationFrame(gameLoop);
            completedLevelElement.textContent = level;
            prizeAmountElement.textContent = `${levelRewards[level]} F`;
            levelCompleteModal.classList.remove('hidden');
            createConfetti();
            return true;
        }
        return false;
    }

    function createConfetti() {
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    function nextLevel() {
        level++;
        score = 0;
        gameSpeed += 2;
        snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
        direction = 'right';
        nextDirection = 'right';
        activePowerUps = {};
        obstacles = [];
        powerUps = [];
        generateFood();
        generateObstacles(level * 2);
        updateUI();
        levelCompleteModal.classList.add('hidden');
        startCountdown(() => {
            gameRunning = true;
            gameLoop = requestAnimationFrame(update);
        });
    }

    function generateFood() {
        let newFood;
        let overlapping;
        do {
            overlapping = false;
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize),
                type: Math.random() < 0.15 ? 'golden' : 'normal'
            };
            snake.forEach(segment => {
                if (segment.x === newFood.x && segment.y === newFood.y) overlapping = true;
            });
            obstacles.forEach(obs => {
                if (obs.x === newFood.x && obs.y === newFood.y) overlapping = true;
            });
            powerUps.forEach(pu => {
                if (pu.x === newFood.x && pu.y === newFood.y) overlapping = true;
            });
        } while (overlapping);
        food = newFood;
    }

    function generateObstacles(count = Math.min(level * 2, 10)) {
        for (let i = 0; i < count; i++) {
            let obstacle;
            let overlapping;
            do {
                overlapping = false;
                obstacle = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                };
                snake.forEach(segment => {
                    if (segment.x === obstacle.x && segment.y === obstacle.y) overlapping = true;
                });
                if (food.x === obstacle.x && food.y === obstacle.y) overlapping = true;
                obstacles.forEach(other => {
                    if (other.x === obstacle.x && other.y === obstacle.y) overlapping = true;
                });
            } while (overlapping);
            obstacles.push(obstacle);
        }
    }

    function generatePowerUp() {
        if (Math.random() < 0.05 && powerUps.length < 2) {
            let powerUp;
            let overlapping;
            const types = ['slow', 'ghost', 'shrink', 'doublePoints'];
            const type = types[Math.floor(Math.random() * types.length)];
            do {
                overlapping = false;
                powerUp = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize),
                    type: type,
                    duration: 5000
                };
                snake.forEach(segment => {
                    if (segment.x === powerUp.x && segment.y === powerUp.y) overlapping = true;
                });
                if (food.x === powerUp.x && food.y === powerUp.y) overlapping = true;
                obstacles.forEach(obs => {
                    if (obs.x === powerUp.x && obs.y === powerUp.y) overlapping = true;
                });
                powerUps.forEach(other => {
                    if (other.x === powerUp.x && other.y === powerUp.y) overlapping = true;
                });
            } while (overlapping);
            powerUps.push(powerUp);
        }
    }

    function updatePowerUpIndicators() {
        powerUpIndicator.innerHTML = '';
        for (let type in activePowerUps) {
            const powerUp = activePowerUps[type];
            const remaining = (powerUp.endTime - Date.now()) / powerUp.duration * 100;
            const elem = document.createElement('div');
            elem.className = 'power-up';
            let icon, name;
            switch (type) {
                case 'slow': icon = '⏱️'; name = 'Ralenti'; break;
                case 'ghost': icon = '👻'; name = 'Fantôme'; break;
                case 'shrink': icon = '🔍'; name = 'Réduction'; break;
                case 'doublePoints': icon = '2️⃣'; name = 'Double Points'; break;
            }
            elem.innerHTML = `
                <i>${icon}</i> ${name}
                <div class="power-up-timer"><div class="timer-fill" style="width: ${remaining}%"></div></div>
            `;
            powerUpIndicator.appendChild(elem);
        }
    }

    function checkCollisions() {
        let head = snake[0];
        if (gameMode === 'infinite' || activePowerUps.ghost) {
            if (head.x < 0) head.x = gridSize - 1;
            if (head.x >= gridSize) head.x = 0;
            if (head.y < 0) head.y = gridSize - 1;
            if (head.y >= gridSize) head.y = 0;
        } else {
            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                loseLife();
                return;
            }
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                loseLife();
                return;
            }
        }
        obstacles.forEach(obs => {
            if (head.x === obs.x && head.y === obs.y && !activePowerUps.ghost) {
                loseLife();
                return;
            }
        });
        if (head.x === food.x && head.y === food.y) {
            eatFood();
        }
        for (let i = powerUps.length - 1; i >= 0; i--) {
            if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
                activatePowerUp(powerUps[i]);
                powerUps.splice(i, 1);
            }
        }
    }

    function eatFood() {
        if (score === 0) showAchievement('firstWin');
        let points = food.type === 'golden' ? 20 : 10;
        if (activePowerUps.doublePoints) points *= 2;

        // Calculer le nouveau score
        let newScore = score + points;

        // Vérifier si le nouveau score atteint ou dépasse la cible du niveau
        if (levelTargets[level] && newScore >= levelTargets[level]) {
            // Plafonner le score à la cible du niveau
            score = levelTargets[level];
            scoreElement.textContent = score;
            snake.push({ ...snake[snake.length - 1] });
            generateFood();
            vibrate();
            updateUI();
            checkLevelCompletion();
            return; // Arrêter ici pour éviter d'autres modifications
        }

        // Si la cible n'est pas atteinte, ajouter les points normalement
        score = newScore;
        if (score > stats.bestScore) stats.bestScore = score;
        snake.push({ ...snake[snake.length - 1] });
        generateFood();
        vibrate();
        if (score >= 100) showAchievement('highScore100');
        updateUI();
        checkLevelCompletion();
    }

    function activatePowerUp(powerUp) {
        activePowerUps[powerUp.type] = { endTime: Date.now() + powerUp.duration, duration: powerUp.duration };
        if (powerUp.type === 'shrink') {
            if (snake.length > 3) snake.length = 3;
        }
        updatePowerUpIndicators();
    }

    function checkPowerUps() {
        for (let type in activePowerUps) {
            if (Date.now() > activePowerUps[type].endTime) {
                delete activePowerUps[type];
                updatePowerUpIndicators();
            }
        }
    }

    function levelUp() {
        level++;
        gameSpeed += 1;
        generateObstacles(2);
        if (level === 5) showAchievement('level5');
        updateUI();
    }

    function loseLife() {
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        lives--;
        score = 0;
        level = 1;
        gameSpeed = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : difficulty === 'hard' ? 9 : 12;
        vibrate(200);
        if (lives <= 0) {
            gameOver();
        } else {
            snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
            direction = 'right';
            nextDirection = 'right';
            activePowerUps = {};
            obstacles = [];
            powerUps = [];
            generateFood();
            updateUI();
            startCountdown(() => {
                gameRunning = true;
                gameLoop = requestAnimationFrame(update);
            });
        }
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        if (timedModeTimer) clearTimeout(timedModeTimer);
        if (obstacleInterval) clearInterval(obstacleInterval);
        totalTime += (Date.now() - gameStartTime) / 1000;
        stats.time = totalTime;
        saveToLocal('stats', stats);
        document.getElementById('final-score').textContent = stats.bestScore;
        if (highScores.length < 10 || stats.bestScore > Math.min(...highScores)) {
            updateHighScores();
            document.getElementById('new-highscore-message').classList.remove('hidden');
        } else {
            document.getElementById('new-highscore-message').classList.add('hidden');
        }
        hideAllScreens();
        gameOverScreen.classList.remove('hidden');
    }

    function togglePause() {
        if (!gameRunning || countdownActive) return;
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        hideAllScreens();
        pauseScreen.classList.remove('hidden');
    }

    function resumeGame() {
        startCountdown(() => {
            gameRunning = true;
            pauseScreen.classList.add('hidden');
            gameLoop = requestAnimationFrame(update);
        });
    }

    let lastUpdateTime = 0;
    function update(timestamp) {
        if (!gameRunning) return;
        let effectiveSpeed = gameSpeed;
        if (activePowerUps.slow) effectiveSpeed /= 2;
        if (timestamp - lastUpdateTime > 1000 / effectiveSpeed) {
            direction = nextDirection;
            let head = { ...snake[0] };
            switch (direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }
            snake.unshift(head);
            snake.pop();
            checkCollisions();
            checkPowerUps();
            generatePowerUp();
            draw();
            lastUpdateTime = timestamp;
        }
        gameLoop = requestAnimationFrame(update);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'var(--grid-color)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
        let snakeColor = skins.includes('neon') ? '#00FFFF' : '#4CAF50';
        let headColor = skins.includes('neon') ? '#00BFFF' : '#2E7D32';
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? (activePowerUps.ghost ? `rgba(${parseInt(headColor.slice(1, 3), 16)}, ${parseInt(headColor.slice(3, 5), 16)}, ${parseInt(headColor.slice(5, 7), 16)}, 0.7)` : headColor) : (activePowerUps.ghost ? `rgba(${parseInt(snakeColor.slice(1, 3), 16)}, ${parseInt(snakeColor.slice(3, 5), 16)}, ${parseInt(snakeColor.slice(5, 7), 16)}, 0.7)` : snakeColor);
            ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            if (i === 0) {
                ctx.fillStyle = '#FFFFFF';
                let eyeX1, eyeY1, eyeX2, eyeY2;
                switch (direction) {
                    case 'right':
                        eyeX1 = segment.x * cellSize + cellSize * 0.7;
                        eyeY1 = segment.y * cellSize + cellSize * 0.3;
                        eyeX2 = segment.x * cellSize + cellSize * 0.7;
                        eyeY2 = segment.y * cellSize + cellSize * 0.7;
                        break;
                    case 'left':
                        eyeX1 = segment.x * cellSize + cellSize * 0.3;
                        eyeY1 = segment.y * cellSize + cellSize * 0.3;
                        eyeX2 = segment.x * cellSize + cellSize * 0.3;
                        eyeY2 = segment.y * cellSize + cellSize * 0.7;
                        break;
                    case 'up':
                        eyeX1 = segment.x * cellSize + cellSize * 0.3;
                        eyeY1 = segment.y * cellSize + cellSize * 0.3;
                        eyeX2 = segment.x * cellSize + cellSize * 0.7;
                        eyeY2 = segment.y * cellSize + cellSize * 0.3;
                        break;
                    case 'down':
                        eyeX1 = segment.x * cellSize + cellSize * 0.3;
                        eyeY1 = segment.y * cellSize + cellSize * 0.7;
                        eyeX2 = segment.x * cellSize + cellSize * 0.7;
                        eyeY2 = segment.y * cellSize + cellSize * 0.7;
                        break;
                }
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, cellSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, cellSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        if (food.x !== undefined) {
            ctx.fillStyle = food.type === 'golden' ? '#FFD700' : '#FF5722';
            ctx.beginPath();
            ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#78909C';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x * cellSize, obs.y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = '#546E7A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x * cellSize, obs.y * cellSize);
            ctx.lineTo(obs.x * cellSize + cellSize, obs.y * cellSize + cellSize);
            ctx.moveTo(obs.x * cellSize + cellSize, obs.y * cellSize);
            ctx.lineTo(obs.x * cellSize, obs.y * cellSize + cellSize);
            ctx.stroke();
        });
        powerUps.forEach(pu => {
            let color, symbol;
            switch (pu.type) {
                case 'slow': color = '#3F51B5'; symbol = '⏱️'; break;
                case 'ghost': color = '#9C27B0'; symbol = '👻'; break;
                case 'shrink': color = '#00BCD4'; symbol = '🔍'; break;
                case 'doublePoints': color = '#FFC107'; symbol = '2️⃣'; break;
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pu.x * cellSize + cellSize / 2, pu.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = `${cellSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(symbol, pu.x * cellSize + cellSize / 2, pu.y * cellSize + cellSize / 2);
        });
    }

    function handleKeyDown(e) {
        if (!gameRunning || countdownActive) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': if (direction !== 'down') nextDirection = 'up'; break;
            case 'ArrowDown': case 's': case 'S': if (direction !== 'up') nextDirection = 'down'; break;
            case 'ArrowLeft': case 'a': case 'A': if (direction !== 'right') nextDirection = 'left'; break;
            case 'ArrowRight': case 'd': case 'D': if (direction !== 'left') nextDirection = 'right'; break;
            case ' ': case 'Escape': togglePause(); break;
        }
    }

    let touchStartX = null;
    let touchStartY = null;
    function handleTouchStart(e) {
        if (!useSwipeControls) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!useSwipeControls || touchStartX === null || countdownActive) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction !== 'left') nextDirection = 'right';
            else if (dx < 0 && direction !== 'right') nextDirection = 'left';
        } else {
            if (dy > 0 && direction !== 'up') nextDirection = 'down';
            else if (dy < 0 && direction !== 'down') nextDirection = 'up';
        }
        touchStartX = null;
        touchStartY = null;
    }

    function hideAllScreens() {
        [welcomeScreen, pauseScreen, gameOverScreen, settingsScreen, scoresScreen, statsScreen, aboutScreen, tutorialScreen, levelCompleteModal].forEach(screen => screen.classList.add('hidden'));
    }

    function setupEventListeners() {
        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        pauseButton.addEventListener('click', togglePause);
        upBtn.addEventListener('click', () => { if (direction !== 'down' && !countdownActive) nextDirection = 'up'; });
        leftBtn.addEventListener('click', () => { if (direction !== 'right' && !countdownActive) nextDirection = 'left'; });
        rightBtn.addEventListener('click', () => { if (direction !== 'left' && !countdownActive) nextDirection = 'right'; });
        downBtn.addEventListener('click', () => { if (direction !== 'up' && !countdownActive) nextDirection = 'down'; });
        playBtn.addEventListener('click', initGame);
        optionsBtn.addEventListener('click', () => { hideAllScreens(); settingsScreen.classList.remove('hidden'); });
        scoresBtn.addEventListener('click', () => { updateHighScores(); hideAllScreens(); scoresScreen.classList.remove('hidden'); });
        statsBtn.addEventListener('click', () => { updateStatsScreen(); hideAllScreens(); statsScreen.classList.remove('hidden'); });
        aboutBtn.addEventListener('click', () => { hideAllScreens(); aboutScreen.classList.remove('hidden'); });
        tutorialBtn.addEventListener('click', () => { hideAllScreens(); tutorialScreen.classList.remove('hidden'); });
        resumeBtn.addEventListener('click', resumeGame);
        restartBtn.addEventListener('click', initGame);
        settingsPauseBtn.addEventListener('click', () => { pauseScreen.classList.add('hidden'); settingsScreen.classList.remove('hidden'); });
        mainMenuBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        playAgainBtn.addEventListener('click', initGame);
        gameOverMenuBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        nextLevelButton.addEventListener('click', nextLevel);
        closeModalButton.addEventListener('click', () => { levelCompleteModal.classList.add('hidden'); gameOver(); });
        shareBtn.addEventListener('click', () => {
            const shareData = {
                title: 'Snake Game Pro',
                text: `J'ai fait ${stats.bestScore} points dans Snake Game Pro ! Essayez de battre mon score !`,
                url: window.location.href
            };
            if (navigator.share) {
                navigator.share(shareData).catch(err => console.error('Erreur lors du partage:', err));
            } else {
                navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
                    .then(() => alert('Score copié dans le presse-papiers !'))
                    .catch(err => console.error('Erreur lors de la copie:', err));
            }
        });
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                difficulty = btn.dataset.difficulty;
            });
        });
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameMode = btn.dataset.mode;
            });
        });
        swipeControlsCheckbox.addEventListener('change', () => {
            useSwipeControls = swipeControlsCheckbox.checked;
        });
        buttonControlsCheckbox.addEventListener('change', () => {
            showButtonControls = buttonControlsCheckbox.checked;
            updateUI();
        });
        backBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        backScores.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        backStats.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        backAbout.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
        backTutorial.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('hidden'); });
    }

    // Initialisation
    initCanvas();
    stats = loadFromLocal('stats', stats);
    highScores = loadFromLocal('highScores', highScores);
    achievements = loadFromLocal('achievements', achievements);
    skins = loadFromLocal('skins', skins);
    setupEventListeners();
    window.addEventListener('resize', initCanvas);
    welcomeScreen.classList.remove('hidden');
});