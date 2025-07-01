import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 200;
        this.direction = 'down';
        this.animationFrame = 0;
        this.animationTime = 0;
        this.walkAnimationSpeed = 300; // ms entre frames
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
            if (this.animationTime > this.walkAnimationSpeed) {
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
        this.attackCooldown = 300;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    render(ctx) {
        // Usar sprites de Kenney
        let sprite = null;
        
        if (this.isMoving && this.animationFrame === 1) {
            sprite = this.assetManager.getSprite('player_walk1');
        }
        
        if (!sprite) {
            sprite = this.assetManager.getSprite('player');
        }
        
        if (sprite) {
            // Aplicar efecto de ataque (tinte rojo)
            if (this.isAttacking) {
                ctx.save();
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = '#ff8888';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
            }
            
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = this.isAttacking ? '#ff6b6b' : '#4ecdc4';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Barra de vida
        this.renderHealthBar(ctx);
    }
    
    renderHealthBar(ctx) {
        const barWidth = 20;
        const barHeight = 3;
        const barX = this.x - 2;
        const barY = this.y - 6;
        
        // Fondo de la barra
        ctx.fillStyle = '#000';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        // Barra roja (daño)
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra verde (vida actual)
        ctx.fillStyle = '#2ed573';
        const healthPercent = this.health / this.maxHealth;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}