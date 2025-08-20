// js/ui.js
// Gestion de l'interface utilisateur

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function updateHUD(game) {
    document.getElementById('score').textContent = `Score: ${game.score}`;
    document.getElementById('lives').textContent = `Vies: ${game.lives}`;
    document.getElementById('level').textContent = `Niveau: ${game.level}`;
}

function loadHighScores() {
    const scores = loadFromLocal('highScores', []);
    const list = document.getElementById('high-scores');
    list.innerHTML = '';
    scores.sort((a, b) => b - a).slice(0, 10).forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        list.appendChild(li);
    });
}

function initUI(game) {
    // Boutons d'accueil
    document.getElementById('play-btn').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('options-btn').addEventListener('click', () => showScreen('options-screen'));
    document.getElementById('scores-btn').addEventListener('click', () => {
        loadHighScores();
        showScreen('scores-screen');
    });

    // Menu principal
    document.getElementById('start-game').addEventListener('click', () => {
        game.mode = document.getElementById('game-mode').value;
        game.difficulty = document.getElementById('difficulty').value;
        game.start();
        showScreen('game-screen');
    });

    // Pause
    document.getElementById('pause-btn').addEventListener('click', () => {
        game.pause();
        showScreen('pause-menu');
    });
    document.getElementById('resume-btn').addEventListener('click', () => {
        game.resume();
        showScreen('game-screen');
    });

    // Game Over
    document.getElementById('replay-btn').addEventListener('click', () => game.restart());
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Snake Game Pro',
                text: `J'ai fait ${game.score} points !`,
                url: window.location.href
            });
        }
    });

    // Options
    document.getElementById('sound-toggle').addEventListener('change', e => {
        localStorage.setItem('sound', e.target.checked ? 'on' : 'off');
    });
    // Similaire pour vibrations et contrôles

    // Chargement initial des options
    document.getElementById('sound-toggle').checked = localStorage.getItem('sound') !== 'off';
    // Similaire pour autres
}