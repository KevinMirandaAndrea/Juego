import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 100; // píxeles por segundo
        this.health = 100;
        this.maxHealth = 100;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 200; // ms
        this.direction = 'down';
        this.animationFrame = 0;
        this.animationTime = 0;
    }
    
    update(deltaTime, inputManager, dungeon) {
        this.handleInput(inputManager, deltaTime);
        this.updatePosition(deltaTime, dungeon);
        this.updateAnimation(deltaTime);
        this.updateAttack(deltaTime);
    }
    
    handleInput(inputManager, deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 1000);
        let newX = this.x;
        let newY = this.y;
        let moving = false;
        
        if (inputManager.isKeyPressed('ArrowUp') || inputManager.isKeyPressed('KeyW')) {
            newY -= moveSpeed;
            this.direction = 'up';
            moving = true;
        }
        if (inputManager.isKeyPressed('ArrowDown') || inputManager.isKeyPressed('KeyS')) {
            newY += moveSpeed;
            this.direction = 'down';
            moving = true;
        }
        if (inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('KeyA')) {
            newX -= moveSpeed;
            this.direction = 'left';
            moving = true;
        }
        if (inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('KeyD')) {
            newX += moveSpeed;
            this.direction = 'right';
            moving = true;
        }
        
        if (inputManager.isKeyPressed('Space') && this.attackCooldown <= 0) {
            this.attack();
        }
        
        this.targetX = newX;
        this.targetY = newY;
        this.isMoving = moving;
    }
    
    updatePosition(deltaTime, dungeon) {
        // Verificar colisiones con paredes
        const tileX = Math.floor(this.targetX / 16);
        const tileY = Math.floor(this.targetY / 16);
        
        if (!dungeon.isWall(tileX, tileY)) {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.animationTime += deltaTime;
            if (this.animationTime > 200) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.animationTime = 0;
            }
        } else {
            this.animationFrame = 0;
        }
    }
    
    updateAttack(deltaTime) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.isAttacking) {
            this.attackDuration -= deltaTime;
            if (this.attackDuration <= 0) {
                this.isAttacking = false;
                this.attackDuration = 200;
            }
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.attackCooldown = 300; // ms
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    render(ctx) {
        // Renderizar sprite del jugador
        const sprite = this.assetManager.getSprite('player');
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback si no hay sprite
            ctx.fillStyle = this.isAttacking ? '#ff6b6b' : '#4ecdc4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Renderizar barra de vida
        const barWidth = 20;
        const barHeight = 4;
        const barX = this.x - 2;
        const barY = this.y - 8;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#4ecdc4';
        const healthPercent = this.health / this.maxHealth;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}