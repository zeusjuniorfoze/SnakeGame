// js/controls.js
// Gestion des contrôles tactiles et swipe

let touchStartX, touchStartY;

function initControls(game) {
    const canvas = game.canvas;

    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
    });

    canvas.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) game.snake.changeDirection('Right');
            else game.snake.changeDirection('Left');
        } else {
            if (dy > 0) game.snake.changeDirection('Down');
            else game.snake.changeDirection('Up');
        }
    });

    // Boutons virtuels si activés
    const controlsToggle = document.getElementById('controls-toggle');
    if (controlsToggle.checked) {
        document.getElementById('virtual-controls').classList.remove('hidden');
        // Ajouter event listeners pour boutons
        document.querySelector('.arrow.up').addEventListener('click', () => game.snake.changeDirection('Up'));
        // Similaire pour les autres
    }
}