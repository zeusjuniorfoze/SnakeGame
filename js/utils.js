// js/utils.js
// Fonctions utilitaires

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function vibrate(duration = 50) {
    if (navigator.vibrate && localStorage.getItem('vibrations') !== 'off') {
        navigator.vibrate(duration);
    }
}

function saveToLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocal(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Gestion des achievements (exemple)
const achievements = loadFromLocal('achievements', []);

// Ajout d'un achievement
function unlockAchievement(name) {
    if (!achievements.includes(name)) {
        achievements.push(name);
        saveToLocal('achievements', achievements);
        alert(`Achievement débloqué : ${name}`);
    }
}