import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Dungeon } from './world/Dungeon.js';
import { InputManager } from './input/InputManager.js';
import { AssetManager } from './assets/AssetManager.js';
import { Camera } from './Camera.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.assetManager = new AssetManager();
        this.inputManager = new InputManager();
        this.camera = new Camera(0, 0, this.width, this.height);
        
        this.player = null;
        this.enemies = [];
        this.dungeon = null;
        
        this.gameState = 'loading'; // loading, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    async start() {
        try {
            await this.assetManager.loadAssets();
            this.initGame();
            this.gameState = 'playing';
            requestAnimationFrame(this.gameLoop);
        } catch (error) {
            console.error('Error loading game assets:', error);
        }
    }
    
    initGame() {
        // Crear la mazmorra
        this.dungeon = new Dungeon(40, 30, this.assetManager);
        
        // Crear el jugador en el centro de la mazmorra
        const startX = this.dungeon.width * 16 / 2;
        const startY = this.dungeon.height * 16 / 2;
        this.player = new Player(startX, startY, this.assetManager);
        
        // Crear algunos enemigos
        this.spawnEnemies();
        
        // Configurar la cámara para seguir al jugador
        this.camera.follow(this.player);
    }
    
    spawnEnemies() {
        const enemyCount = 5 + this.level * 2;
        this.enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            let x, y;
            do {
                x = Math.random() * (this.dungeon.width - 2) + 1;
                y = Math.random() * (this.dungeon.height - 2) + 1;
            } while (this.dungeon.isWall(Math.floor(x), Math.floor(y)));
            
            this.enemies.push(new Enemy(x * 16, y * 16, this.assetManager));
        }
    }
    
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        // Actualizar jugador
        this.player.update(deltaTime, this.inputManager, this.dungeon);
        
        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player, this.dungeon);
        });
        
        // Verificar colisiones entre jugador y enemigos
        this.checkCollisions();
        
        // Actualizar cámara
        this.camera.update();
        
        // Actualizar UI
        this.updateUI();
        
        // Verificar condiciones de victoria/derrota
        this.checkGameConditions();
    }
    
    checkCollisions() {
        this.enemies.forEach((enemy, index) => {
            if (this.player.isAttacking && this.player.getBounds().intersects(enemy.getBounds())) {
                this.enemies.splice(index, 1);
                this.score += 10;
            } else if (this.player.getBounds().intersects(enemy.getBounds())) {
                this.player.takeDamage(1);
            }
        });
    }
    
    checkGameConditions() {
        if (this.player.health <= 0) {
            this.gameState = 'gameOver';
            alert('¡Game Over! Puntuación final: ' + this.score);
        } else if (this.enemies.length === 0) {
            this.level++;
            this.spawnEnemies();
            this.player.health = Math.min(100, this.player.health + 20);
        }
    }
    
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Aplicar transformación de cámara
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Renderizar mazmorra
        this.dungeon.render(this.ctx, this.camera);
        
        // Renderizar enemigos
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Renderizar jugador
        this.player.render(this.ctx);
        
        this.ctx.restore();
    }
    
    updateUI() {
        document.getElementById('health').textContent = this.player.health;
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
    }
}