// Configuration et initialisation du jeu
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
    const levelCompleteModal = new bootstrap.Modal(document.getElementById('level-complete-modal'));
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
    let useSoundEffects = true;
    let useBackgroundMusic = false;

    // Objectifs de niveau
    const levelTargets = {
        1: 500,
        2: 1000,
        3: 2000,
        4: 3000,
        5: 40000
    };

    // Récompenses par niveau
    const levelRewards = {
        1: 500,
        2: 1000,
        3: 1500,
        4: 2000,
        5: 2500
    };

    // Audio - Correction des erreurs de fichiers audio manquants
    const audio = {
        eat: new Audio(),
        gameOver: new Audio(),
        background: new Audio(),
        powerUp: new Audio(),
        countdown: new Audio(),
        levelComplete: new Audio()
    };
    
    // Désactiver la lecture audio si les fichiers ne sont pas disponibles
    Object.keys(audio).forEach(key => {
        audio[key].onerror = () => {
            console.warn(`Fichier audio pour ${key} non trouvé, désactivation du son`);
            useSoundEffects = false;
            useBackgroundMusic = false;
            soundEffectsCheckbox.checked = false;
            backgroundMusicCheckbox.checked = false;
        };
    });
    
    audio.background.loop = true;

    // Statistiques et progression
    let stats = {
        games: 0,
        time: 0,
        bestScore: 0
    };
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
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    function saveToLocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function vibrate(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    function showAchievement(id) {
        const ach = achievementList.find(a => a.id === id);
        if (ach && !achievements.includes(id)) {
            achievements.push(id);
            saveToLocal('achievements', achievements);
            achievementTitle.textContent = ach.title;
            achievementDesc.textContent = ach.desc;
            
            // Utiliser le toast Bootstrap
            const toast = new bootstrap.Toast(achievementToast);
            toast.show();
        }
    }

    function updateStatsScreen() {
        document.getElementById('games-played').textContent = `Parties jouées: ${stats.games}`;
        document.getElementById('total-time').textContent = `Temps total: ${Math.floor(stats.time / 60)} min`;
        document.getElementById('best-score').textContent = `Meilleur score: ${stats.bestScore}`;
    }

    function updateHighScores() {
        highScores.push(score);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 10);
        saveToLocal('highScores', highScores);
        const list = document.getElementById('high-scores');
        list.innerHTML = '';
        highScores.forEach((s, i) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>#${i + 1}</span>
                <span class="badge bg-primary rounded-pill">${s}</span>
            `;
            list.appendChild(li);
        });
    }

    // Initialisation du canvas
    function initCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth;

        canvasSize = Math.min(containerWidth, window.innerHeight * 0.7);
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        cellSize = canvasSize / gridSize;
    }

    // Décompte avant le jeu
    function startCountdown(callback) {
        countdownActive = true;
        countdownElement.classList.remove('d-none');
        let count = 3;
        
        countdownElement.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
                if (useSoundEffects) {
                    try {
                        audio.countdown.play().catch(e => console.log("Audio countdown non joué:", e));
                    } catch (e) {
                        console.log("Erreur lecture audio:", e);
                    }
                }
            } else {
                clearInterval(countdownInterval);
                countdownElement.textContent = "GO!";
                if (useSoundEffects) {
                    try {
                        audio.countdown.play().catch(e => console.log("Audio countdown non joué:", e));
                    } catch (e) {
                        console.log("Erreur lecture audio:", e);
                    }
                }
                
                setTimeout(() => {
                    countdownElement.classList.add('d-none');
                    countdownActive = false;
                    callback();
                }, 500);
            }
        }, 1000);
    }

    // Initialisation du jeu
    function initGame() {
        stats.games++;
        gameStartTime = Date.now();
        saveToLocal('stats', stats);
        snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        lives = 3;
        level = 1;
        obstacles = [];
        powerUps = [];
        activePowerUps = {};

        updateUI();

        generateFood();

        hideAllScreens();
        welcomeScreen.classList.add('d-none');

        // Démarrer le décompte avant de lancer le jeu
        startCountdown(() => {
            gameRunning = true;

            if (gameLoop) cancelAnimationFrame(gameLoop);
            gameLoop = requestAnimationFrame(update);

            if (useBackgroundMusic) {
                try {
                    audio.background.play().catch(e => console.log("Audio background non joué:", e));
                } catch (e) {
                    console.log("Erreur lecture audio:", e);
                }
            }

            if (gameMode === 'timed') {
                timedModeTimer = setTimeout(gameOver, 120000); // 2 minutes
            }

            if (gameMode === 'survival') {
                obstacleInterval = setInterval(() => generateObstacles(1), 10000); // Ajout obstacle toutes 10s
                setTimeout(() => {
                    if (gameRunning) showAchievement('survivalMaster');
                }, 120000); // Achievement si survie 2 min
            }
        });
    }

    // Mise à jour de l'interface utilisateur
    function updateUI() {
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = level;

        updatePowerUpIndicators();
    }

    // Vérifier si le niveau est terminé
    function checkLevelCompletion() {
        if (levelTargets[level] && score >= levelTargets[level]) {
            // Niveau terminé!
            gameRunning = false;
            cancelAnimationFrame(gameLoop);
            
            // Afficher le modal de félicitations
            completedLevelElement.textContent = level;
            prizeAmountElement.textContent = levelRewards[level] + " F";
            levelCompleteModal.show();
            
            if (useSoundEffects) {
                try {
                    audio.levelComplete.play().catch(e => console.log("Audio levelComplete non joué:", e));
                } catch (e) {
                    console.log("Erreur lecture audio:", e);
                }
            }
            createConfetti();
            
            return true;
        }
        return false;
    }

    // Créer des confettis pour célébrer
    function createConfetti() {
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);
            
            // Animation
            const animation = confetti.animate([
                { top: '-10px', transform: `rotate(0deg)` },
                { top: '100vh', transform: `rotate(${Math.random() * 720}deg)` }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0.1, 0.8, 0.1, 1)'
            });
            
            animation.onfinish = () => {
                confetti.remove();
            };
        }
    }

    // Passer au niveau suivant
    function nextLevel() {
        level++;
        gameSpeed += 2;
        generateObstacles(level * 2);
        
        levelCompleteModal.hide();
        
        // Démarrer le décompte avant de reprendre
        startCountdown(() => {
            gameRunning = true;
            if (useBackgroundMusic) {
                try {
                    audio.background.play().catch(e => console.log("Audio background non joué:", e));
                } catch (e) {
                    console.log("Erreur lecture audio:", e);
                }
            }
            gameLoop = requestAnimationFrame(update);
        });
    }

    // Générer de la nourriture
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

    // Générer des obstacles
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

    // Générer des power-ups
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
                    duration: 5000 // 5 secondes pour équilibre
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

    // Mettre à jour les indicateurs de power-ups
    function updatePowerUpIndicators() {
        powerUpIndicator.innerHTML = '';

        for (let type in activePowerUps) {
            const powerUp = activePowerUps[type];
            const remaining = (powerUp.endTime - Date.now()) / powerUp.duration * 100;

            const elem = document.createElement('div');
            elem.className = 'power-up badge bg-info text-dark m-1';

            let icon, name;
            switch (type) {
                case 'slow': icon = '⏱️'; name = 'Ralenti'; break;
                case 'ghost': icon = '👻'; name = 'Fantôme'; break;
                case 'shrink': icon = '🔍'; name = 'Réduction'; break;
                case 'doublePoints': icon = '2️⃣'; name = 'Double Points'; break;
            }

            elem.innerHTML = `
                <i>${icon}</i> ${name}
                <div class="progress mt-1" style="height: 5px; width: 40px;">
                    <div class="progress-bar" role="progressbar" style="width: ${remaining}%"></div>
                </div>
            `;
            powerUpIndicator.appendChild(elem);
        }
    }

    // Gérer les collisions
    function checkCollisions() {
        let head = snake[0];

        // Mode infini ou ghost
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

        // Collision corps
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                loseLife();
                return;
            }
        }

        // Collision obstacles
        obstacles.forEach(obs => {
            if (head.x === obs.x && head.y === obs.y && !activePowerUps.ghost) {
                loseLife();
                return;
            }
        });

        // Nourriture
        if (head.x === food.x && head.y === food.y) {
            eatFood();
        }

        // Power-ups
        for (let i = 0; i < powerUps.length; i++) {
            if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
                activatePowerUp(powerUps[i]);
                powerUps.splice(i, 1);
            }
        }
    }

    // Manger de la nourriture
    function eatFood() {
        if (score === 0) showAchievement('firstWin'); // Déclenche le premier repas

        let points = food.type === 'golden' ? 20 : 10;
        if (activePowerUps.doublePoints) points *= 2;

        score += points;
        snake.push({ ...snake[snake.length - 1] });
        generateFood();

        if (useSoundEffects) {
            try {
                audio.eat.play().catch(e => console.log("Audio eat non joué:", e));
            } catch (e) {
                console.log("Erreur lecture audio:", e);
            }
        }
        vibrate();

        if (score >= 100) showAchievement('highScore100');
        if (score % 50 === 0) levelUp();

        // Vérifier si le niveau est terminé
        if (checkLevelCompletion()) {
            return;
        }

        updateUI();
    }

    // Activer un power-up
    function activatePowerUp(powerUp) {
        activePowerUps[powerUp.type] = { endTime: Date.now() + powerUp.duration, duration: powerUp.duration };
        if (useSoundEffects) {
            try {
                audio.powerUp.play().catch(e => console.log("Audio powerUp non joué:", e));
            } catch (e) {
                console.log("Erreur lecture audio:", e);
            }
        }

        if (powerUp.type === 'shrink') {
            if (snake.length > 3) snake.length = 3;
        }

        updatePowerUpIndicators();
    }

    // Vérifier l'expiration des power-ups
    function checkPowerUps() {
        for (let type in activePowerUps) {
            if (Date.now() > activePowerUps[type].endTime) {
                delete activePowerUps[type];
                updatePowerUpIndicators();
            }
        }
    }

    // Monter de niveau
    function levelUp() {
        level++;
        gameSpeed += 1;
        generateObstacles(2);
        if (level === 5) showAchievement('level5');

        updateUI();
    }

    // Perdre une vie
    function loseLife() {
        lives--;
        vibrate(200);

        if (lives <= 0) {
            gameOver();
        } else {
            // Démarrer le décompte avant de reprendre
            startCountdown(() => {
                snake = [
                    { x: 5, y: 10 },
                    { x: 4, y: 10 },
                    { x: 3, y: 10 }
                ];
                direction = 'right';
                nextDirection = 'right';
                activePowerUps = {};
                updateUI();
                gameRunning = true;
                if (useBackgroundMusic) {
                    try {
                        audio.background.play().catch(e => console.log("Audio background non joué:", e));
                    } catch (e) {
                        console.log("Erreur lecture audio:", e);
                    }
                }
                gameLoop = requestAnimationFrame(update);
            });
        }
    }

    // Game Over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        if (timedModeTimer) clearTimeout(timedModeTimer);
        if (obstacleInterval) clearInterval(obstacleInterval);
        audio.background.pause();
        if (useSoundEffects) {
            try {
                audio.gameOver.play().catch(e => console.log("Audio gameOver non joué:", e));
            } catch (e) {
                console.log("Erreur lecture audio:", e);
            }
        }

        totalTime += (Date.now() - gameStartTime) / 1000;
        stats.time = totalTime;
        if (score > stats.bestScore) stats.bestScore = score;
        saveToLocal('stats', stats);

        document.getElementById('final-score').textContent = score;

        if (highScores.length < 10 || score > Math.min(...highScores)) {
            updateHighScores();
            document.getElementById('new-highscore-message').classList.remove('d-none');
        } else {
            document.getElementById('new-highscore-message').classList.add('d-none');
        }

        hideAllScreens();
        gameOverScreen.classList.remove('d-none');
    }

    // Pause du jeu
    function togglePause() {
        if (!gameRunning || countdownActive) return;

        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        audio.background.pause();
        hideAllScreens();
        pauseScreen.classList.remove('d-none');
    }

    // Reprendre le jeu
    function resumeGame() {
        // Démarrer le décompte avant de reprendre
        startCountdown(() => {
            gameRunning = true;
            pauseScreen.classList.add('d-none');
            if (useBackgroundMusic) {
                try {
                    audio.background.play().catch(e => console.log("Audio background non joué:", e));
                } catch (e) {
                    console.log("Erreur lecture audio:", e);
                }
            }
            gameLoop = requestAnimationFrame(update);
        });
    }

    // Mise à jour du jeu
    let lastUpdateTime = 0;
    function update(timestamp) {
        if (!gameRunning) return;

        let effectiveSpeed = gameSpeed;
        if (activePowerUps.slow) effectiveSpeed /= 2; // Effet du power-up slow

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

    // Dessiner le jeu
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grille
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

        // Serpent
        let snakeColor = skins.includes('neon') ? '#00FFFF' : '#4CAF50';
        let headColor = skins.includes('neon') ? '#00BFFF' : '#2E7D32';
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? (activePowerUps.ghost ? `rgba(${parseInt(headColor.slice(1,3), 16)}, ${parseInt(headColor.slice(3,5), 16)}, ${parseInt(headColor.slice(5,7), 16)}, 0.7)` : headColor) : (activePowerUps.ghost ? `rgba(${parseInt(snakeColor.slice(1,3), 16)}, ${parseInt(snakeColor.slice(3,5), 16)}, ${parseInt(snakeColor.slice(5,7), 16)}, 0.7)` : snakeColor);
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

        // Nourriture
        ctx.fillStyle = food.type === 'golden' ? '#FFD700' : '#FF5722';
        ctx.beginPath();
        ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Obstacles
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

        // Power-ups
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

    // Gestion des contrôles
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

    // Masquer tous les écrans
    function hideAllScreens() {
        [welcomeScreen, pauseScreen, gameOverScreen, settingsScreen, scoresScreen, statsScreen, aboutScreen, tutorialScreen].forEach(screen => screen.classList.add('d-none'));
    }

    // Configuration des écouteurs d'événements
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
        optionsBtn.addEventListener('click', () => { hideAllScreens(); settingsScreen.classList.remove('d-none'); });
        scoresBtn.addEventListener('click', () => { updateHighScores(); hideAllScreens(); scoresScreen.classList.remove('d-none'); });
        statsBtn.addEventListener('click', () => { updateStatsScreen(); hideAllScreens(); statsScreen.classList.remove('d-none'); });
        aboutBtn.addEventListener('click', () => { hideAllScreens(); aboutScreen.classList.remove('d-none'); });
        tutorialBtn.addEventListener('click', () => { hideAllScreens(); tutorialScreen.classList.remove('d-none'); });

        resumeBtn.addEventListener('click', resumeGame);
        restartBtn.addEventListener('click', () => { initGame(); });
        settingsPauseBtn.addEventListener('click', () => { pauseScreen.classList.add('d-none'); settingsScreen.classList.remove('d-none'); });
        mainMenuBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });

        playAgainBtn.addEventListener('click', () => { initGame(); });
        gameOverMenuBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Snake Game Pro',
                    text: `J'ai fait ${score} points ! Joue avec moi !`,
                    url: window.location.href
                });
            }
        });

        backBtn.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });
        backScores.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });
        backStats.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });
        backAbout.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });
        backTutorial.addEventListener('click', () => { hideAllScreens(); welcomeScreen.classList.remove('d-none'); });

        nextLevelButton.addEventListener('click', nextLevel);
        closeModalButton.addEventListener('click', () => { levelCompleteModal.hide(); });

        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                difficulty = btn.dataset.difficulty;
                switch (difficulty) {
                    case 'easy': gameSpeed = 5; break;
                    case 'medium': gameSpeed = 10; break;
                    case 'hard': gameSpeed = 15; break;
                    case 'expert': gameSpeed = 20; break;
                }
            });
        });

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameMode = btn.dataset.mode;
            });
        });

        swipeControlsCheckbox.addEventListener('change', e => useSwipeControls = e.target.checked);
        buttonControlsCheckbox.addEventListener('change', e => {
            showButtonControls = e.target.checked;
            document.querySelector('.directional-buttons').style.display = showButtonControls ? 'grid' : 'none';
        });
        soundEffectsCheckbox.addEventListener('change', e => useSoundEffects = e.target.checked);
        backgroundMusicCheckbox.addEventListener('change', e => useBackgroundMusic = e.target.checked);

        window.addEventListener('resize', initCanvas);
    }

    // Initialisation
    function init() {
        initCanvas();
        setupEventListeners();
        draw();
        welcomeScreen.classList.remove('d-none');

        // Charger les données sauvegardées
        stats = loadFromLocal('stats', stats);
        highScores = loadFromLocal('highScores', highScores);
        achievements = loadFromLocal('achievements', achievements);
        skins = loadFromLocal('skins', skins);

        // Mettre à jour l'affichage des contrôles
        document.querySelector('.directional-buttons').style.display = showButtonControls ? 'grid' : 'none';

        /* PWA Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }*/
    }

    init();
});