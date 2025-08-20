// js/snake.js
class Snake {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.gridSize = game.gridSize;
        this.dx = this.gridSize;
        this.dy = 0;
        this.cells = [];
        this.maxCells = 4;
        this.skin = 'default'; // Peut être changé avec progression
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Mode infini : passage à travers murs
        if (this.game.mode === 'infinite') {
            if (this.x >= this.game.canvas.width) this.x = 0;
            if (this.x < 0) this.x = this.game.canvas.width;
            if (this.y >= this.game.canvas.height) this.y = 0;
            if (this.y < 0) this.y = this.game.canvas.height;
        } else {
            // Collision murs
            if (this.x >= this.game.canvas.width || this.x < 0 || this.y >= this.game.canvas.height || this.y < 0) {
                this.game.loseLife();
            }
        }

        // Collision corps
        this.cells.forEach(cell => {
            if (cell.x === this.x && cell.y === this.y) {
                this.game.loseLife();
            }
        });

        // Croissance
        if (this.cells.length >= this.maxCells) {
            this.cells.shift();
        }
        this.cells.push({ x: this.x, y: this.y });
    }

    draw(ctx) {
        ctx.fillStyle = '#4CAF50'; // Couleur serpent
        this.cells.forEach(cell => {
            ctx.fillRect(cell.x, cell.y, this.gridSize, this.gridSize);
        });
    }

    changeDirection(direction) {
        switch (direction) {
            case 'Up': if (this.dy === 0) { this.dx = 0; this.dy = -this.gridSize; } break;
            case 'Down': if (this.dy === 0) { this.dx = 0; this.dy = this.gridSize; } break;
            case 'Left': if (this.dx === 0) { this.dx = -this.gridSize; this.dy = 0; } break;
            case 'Right': if (this.dx === 0) { this.dx = this.gridSize; this.dy = 0; } break;
        }
    }
}