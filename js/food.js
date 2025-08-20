// js/food.js
class Food {
    constructor(game) {
        this.game = game;
        this.gridSize = game.gridSize;
        this.reset();
        this.powerUpTimer = null;
        this.powerUpType = null;
    }

    reset() {
        this.x = getRandomInt(0, this.game.canvas.width / this.gridSize) * this.gridSize;
        this.y = getRandomInt(0, this.game.canvas.height / this.gridSize) * this.gridSize;
        this.isPowerUp = Math.random() < 0.1; // 10% chance power-up
        this.type = this.isPowerUp ? getRandomInt(0, 4) : 'normal'; // 0: ralentir, 1: double points, 2: traversée murs, 3: réduction taille
    }

    draw(ctx) {
        ctx.fillStyle = this.isPowerUp ? '#FF9800' : '#2196F3';
        ctx.fillRect(this.x, this.y, this.gridSize, this.gridSize);
    }

    applyPowerUp(type) {
        switch (type) {
            case 0: // Ralentissement
                this.game.speed /= 2;
                setTimeout(() => this.game.speed *= 2, 5000);
                break;
            case 1: // Double points (appliqué lors de la consommation)
                break;
            case 2: // Passage murs
                this.game.tempInfinite = true;
                setTimeout(() => this.game.tempInfinite = false, 5000);
                break;
            case 3: // Réduction taille
                this.game.snake.maxCells -= 2;
                setTimeout(() => this.game.snake.maxCells += 2, 5000);
                break;
        }
    }
}