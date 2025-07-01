import { Player } from './entities/Player.js';
import { Level } from './world/Level.js';
import { InputManager } from './core/InputManager.js';
import { AssetManager } from './core/AssetManager.js';
import { Camera } from './core/Camera.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Core systems
        this.assetManager = new AssetManager();
        this.inputManager = new InputManager();
        this.camera = new Camera(0, 0, this.width, this.height);
        
        // Game objects
        this.player = null;
        this.currentLevel = null;
        this.levels = [];
        
        // Game state
        this.gameState = 'loading'; // loading, playing, paused, gameOver, levelComplete
        this.currentLevelIndex = 0;
        this.totalScore = 0;
        this.gameTime = 0;
        
        // Performance
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.fpsUpdateTime = 0;
        
        // Biomes for level progression
        this.biomes = ['forest', 'cave', 'mountain'];
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    async start() {
        try {
            await this.assetManager.loadAssets();
            this.initGame();
            this.gameState = 'playing';
            requestAnimationFrame(this.gameLoop);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }
    
    initGame() {
        // Create initial level
        this.createLevel(0);
        
        // Create player
        const startX = 32;
        const startY = this.currentLevel.findGroundLevel(2) * 16 - 32;
        this.player = new Player(startX, startY, this.assetManager);
        
        // Setup camera
        this.camera.follow(this.player);
        this.camera.setBounds(0, 0, this.currentLevel.width * 16, this.currentLevel.height * 16);
        
        // Update UI
        this.updateLevelUI();
    }
    
    createLevel(levelIndex) {
        const biome = this.biomes[levelIndex % this.biomes.length];
        const width = 150 + levelIndex * 50; // Levels get progressively larger
        const height = 50;
        
        this.currentLevel = new Level(width, height, biome, this.assetManager);
        this.currentLevelIndex = levelIndex;
        
        // Update camera bounds
        if (this.camera) {
            this.camera.setBounds(0, 0, width * 16, height * 16);
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.updateFPS(deltaTime);
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
    
    updateFPS(deltaTime) {
        this.frameCount++;
        this.fpsUpdateTime += deltaTime;
        
        if (this.fpsUpdateTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / this.fpsUpdateTime);
            this.frameCount = 0;
            this.fpsUpdateTime = 0;
        }
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update input manager
        this.inputManager.update();
        
        // Update player
        this.player.update(deltaTime, this.inputManager, this.currentLevel, this.camera);
        
        // Update level
        this.currentLevel.update(deltaTime);
        
        // Update camera
        this.camera.update(deltaTime);
        
        // Check game conditions
        this.checkGameConditions();
        
        // Handle level transitions
        this.checkLevelCompletion();
    }
    
    checkGameConditions() {
        // Check if player fell out of bounds
        if (this.player.y > this.currentLevel.height * 16) {
            this.player.takeDamage(25);
            this.respawnPlayer();
        }
        
        // Check if player died
        if (this.player.health <= 0) {
            this.gameState = 'gameOver';
            this.showGameOverScreen();
        }
    }
    
    checkLevelCompletion() {
        // Check if player reached the end of the level
        const playerX = this.player.x + this.player.width / 2;
        const levelWidth = this.currentLevel.width * 16;
        
        if (playerX >= levelWidth - 100) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        
        // Add level completion bonus
        const timeBonus = Math.max(0, 10000 - Math.floor(this.gameTime / 1000) * 10);
        const healthBonus = this.player.health * 5;
        const levelBonus = 1000;
        
        this.totalScore += this.player.score + timeBonus + healthBonus + levelBonus;
        
        // Heal player for next level
        this.player.heal(50);
        
        // Create next level
        setTimeout(() => {
            this.createLevel(this.currentLevelIndex + 1);
            this.respawnPlayer();
            this.gameState = 'playing';
            this.gameTime = 0;
            this.updateLevelUI();
        }, 2000);
    }
    
    respawnPlayer() {
        // Find a safe spawn position
        const startX = 32;
        const startY = this.currentLevel.findGroundLevel(2) * 16 - 32;
        
        this.player.x = startX;
        this.player.y = startY;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        
        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
    }
    
    showGameOverScreen() {
        // This would show a game over screen
        setTimeout(() => {
            if (confirm(`Game Over! Final Score: ${this.totalScore + this.player.score}\nPlay again?`)) {
                this.restartGame();
            }
        }, 1000);
    }
    
    restartGame() {
        this.currentLevelIndex = 0;
        this.totalScore = 0;
        this.gameTime = 0;
        this.createLevel(0);
        
        // Reset player
        this.player.health = this.player.maxHealth;
        this.player.energy = this.player.maxEnergy;
        this.player.score = 0;
        this.respawnPlayer();
        
        this.gameState = 'playing';
        this.updateLevelUI();
    }
    
    updateLevelUI() {
        const levelElement = document.getElementById('level');
        const biomeElement = document.getElementById('biome');
        
        if (levelElement) {
            levelElement.textContent = this.currentLevelIndex + 1;
        }
        
        if (biomeElement) {
            const biomeName = this.currentLevel.biome.charAt(0).toUpperCase() + 
                             this.currentLevel.biome.slice(1);
            biomeElement.textContent = biomeName;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.currentLevel && this.player) {
            // Apply camera transformation
            this.ctx.save();
            
            // Render level (includes background)
            this.currentLevel.render(this.ctx, this.camera);
            
            // Render player
            this.player.render(this.ctx, this.camera, this.assetManager);
            
            this.ctx.restore();
            
            // Render UI overlays
            this.renderUI();
        }
        
        // Render game state overlays
        this.renderGameStateOverlays();
    }
    
    renderUI() {
        // FPS counter (debug)
        if (false) { // Set to true for debug mode
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.font = '12px Orbitron';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, this.height - 20);
        }
        
        // Level progress bar
        this.renderProgressBar();
    }
    
    renderProgressBar() {
        const playerProgress = (this.player.x + this.player.width / 2) / (this.currentLevel.width * 16);
        const barWidth = 200;
        const barHeight = 8;
        const barX = this.width - barWidth - 20;
        const barY = 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Border
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Progress fill
        const gradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#00ff88');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * Math.min(1, playerProgress), barHeight);
        
        // Progress text
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = '12px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Level Progress', barX + barWidth / 2, barY - 8);
        this.ctx.textAlign = 'left';
    }
    
    renderGameStateOverlays() {
        switch (this.gameState) {
            case 'levelComplete':
                this.renderLevelCompleteOverlay();
                break;
            case 'paused':
                this.renderPauseOverlay();
                break;
            case 'gameOver':
                this.renderGameOverOverlay();
                break;
        }
    }
    
    renderLevelCompleteOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Level complete text
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = 'bold 48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2 - 50);
        
        // Score information
        this.ctx.font = '24px Orbitron';
        this.ctx.fillText(`Score: ${this.player.score}`, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText(`Total Score: ${this.totalScore}`, this.width / 2, this.height / 2 + 60);
        
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
    }
    
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = 'bold 36px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        this.ctx.textAlign = 'left';
    }
    
    renderGameOverOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ff4757';
        this.ctx.font = 'bold 48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#ff4757';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
    }
}