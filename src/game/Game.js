import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Level } from './world/Level.js';
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
        this.level = null;
        
        this.gameState = 'loading'; // loading, playing, paused, gameOver
        this.score = 0;
        this.levelNumber = 1;
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // Configurar eventos de items y enemigos
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('itemCollected', (event) => {
            const item = event.detail;
            switch (item.type) {
                case 'coin':
                    this.score += 10;
                    break;
                case 'gem_blue':
                case 'gem_red':
                case 'gem_green':
                    this.score += item.value || 50;
                    break;
                default:
                    this.score += 5;
            }
        });
        
        window.addEventListener('enemyDefeated', (event) => {
            const enemy = event.detail;
            this.score += 25;
            
            // Remover enemigo de la lista
            const index = this.enemies.indexOf(enemy);
            if (index > -1) {
                this.enemies.splice(index, 1);
            }
        });
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
        // Crear el nivel
        this.level = new Level(60, 30, this.assetManager);
        
        // Crear el jugador en una posición segura
        const startX = 32; // Cerca del inicio del nivel
        const startY = this.level.height * 16 - 100; // Cerca del suelo
        this.player = new Player(startX, startY, this.assetManager);
        
        // Crear enemigos en las posiciones de spawn del nivel
        this.spawnEnemies();
        
        // Configurar la cámara para seguir al jugador
        this.camera.follow(this.player);
        this.camera.smoothing = 0.05; // Cámara más suave para plataformas
    }
    
    spawnEnemies() {
        this.enemies = [];
        
        // Usar las posiciones de spawn del nivel
        this.level.enemySpawns.forEach(spawn => {
            this.enemies.push(new Enemy(spawn.x * 16, spawn.y * 16, this.assetManager));
        });
        
        // Añadir algunos enemigos adicionales
        const additionalEnemies = 3 + this.levelNumber;
        for (let i = 0; i < additionalEnemies; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = 100 + Math.random() * (this.level.width * 16 - 200);
                y = Math.random() * (this.level.height * 16 - 100);
                attempts++;
            } while (attempts < 50 && (this.level.isSolid(Math.floor(x / 16), Math.floor(y / 16)) || 
                     !this.level.isSolid(Math.floor(x / 16), Math.floor(y / 16) + 1)));
            
            if (attempts < 50) {
                this.enemies.push(new Enemy(x, y, this.assetManager));
            }
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
        this.player.update(deltaTime, this.inputManager, this.level);
        
        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player, this.level);
        });
        
        // Remover enemigos muertos
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        
        // Actualizar cámara
        this.camera.update();
        
        // Mantener al jugador dentro de los límites del nivel
        this.constrainPlayerToLevel();
        
        // Actualizar UI
        this.updateUI();
        
        // Verificar condiciones de juego
        this.checkGameConditions();
    }
    
    constrainPlayerToLevel() {
        // Límites horizontales
        this.player.x = Math.max(0, Math.min(this.player.x, this.level.width * 16 - this.player.width));
        
        // Si el jugador cae fuera del nivel, recibir daño
        if (this.player.y > this.level.height * 16) {
            this.player.takeDamage(20);
            // Reposicionar al jugador
            this.player.x = 32;
            this.player.y = this.level.height * 16 - 100;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }
    
    checkGameConditions() {
        if (this.player.health <= 0) {
            this.gameState = 'gameOver';
            alert('¡Game Over! Puntuación final: ' + this.score);
        } else if (this.enemies.length === 0) {
            // Nivel completado
            this.levelNumber++;
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
            this.score += 100; // Bonus por completar nivel
            
            // Generar nuevo nivel
            this.level = new Level(60 + this.levelNumber * 5, 30, this.assetManager);
            this.spawnEnemies();
            
            // Reposicionar jugador
            this.player.x = 32;
            this.player.y = this.level.height * 16 - 100;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }
    
    render() {
        // Crear gradiente de fondo tipo atardecer
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#FFB347'); // Naranja claro arriba
        gradient.addColorStop(0.7, '#DEB887'); // Beige en el medio
        gradient.addColorStop(1, '#D2691E'); // Chocolate abajo
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Aplicar transformación de cámara
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Renderizar nivel
        this.level.render(this.ctx, this.camera);
        
        // Renderizar enemigos
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Renderizar jugador
        this.player.render(this.ctx);
        
        this.ctx.restore();
        
        // Renderizar efectos de paralaje (nubes, etc.)
        this.renderParallaxBackground();
    }
    
    renderParallaxBackground() {
        // Nubes simples en el fondo
        const cloudOffset = this.camera.x * 0.1;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#FFFFFF';
        
        // Dibujar algunas nubes simples
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 - cloudOffset) % (this.width + 100);
            const y = 50 + Math.sin(i) * 30;
            
            // Nube simple con círculos
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    updateUI() {
        document.getElementById('health').textContent = this.player.health;
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.levelNumber;
    }
}