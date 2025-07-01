export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.alive = true;
        this.health = 100;
        this.maxHealth = 100;
        
        // Physics properties
        this.gravity = 800;
        this.friction = 0.85;
        this.maxFallSpeed = 600;
        
        // Animation
        this.facing = 1; // 1 for right, -1 for left
        this.animationState = 'idle';
        this.animationTime = 0;
        
        // Effects
        this.effects = [];
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }
    
    intersects(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }
    
    distanceTo(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        const dx = bounds1.centerX - bounds2.centerX;
        const dy = bounds1.centerY - bounds2.centerY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    addEffect(effect) {
        this.effects.push(effect);
    }
    
    updateEffects(deltaTime) {
        this.effects = this.effects.filter(effect => {
            effect.update(deltaTime);
            return !effect.finished;
        });
    }
    
    applyPhysics(deltaTime, level) {
        const dt = deltaTime / 1000;
        
        // Apply gravity
        this.velocityY += this.gravity * dt;
        this.velocityY = Math.min(this.velocityY, this.maxFallSpeed);
        
        // Apply friction
        this.velocityX *= this.friction;
        
        // Update position
        this.updatePosition(dt, level);
    }
    
    updatePosition(dt, level) {
        // Horizontal movement
        const newX = this.x + this.velocityX * dt;
        if (this.canMoveToX(newX, level)) {
            this.x = newX;
        } else {
            this.velocityX = 0;
        }
        
        // Vertical movement
        const newY = this.y + this.velocityY * dt;
        this.onGround = false;
        
        if (this.velocityY > 0) { // Falling
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                this.y = Math.floor(this.y / 16) * 16;
                this.velocityY = 0;
                this.onGround = true;
            }
        } else if (this.velocityY < 0) { // Rising
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                this.y = Math.ceil((this.y + this.height) / 16) * 16 - this.height;
                this.velocityY = 0;
            }
        }
    }
    
    canMoveToX(newX, level) {
        const tileX1 = Math.floor(newX / 16);
        const tileX2 = Math.floor((newX + this.width - 1) / 16);
        const tileY1 = Math.floor(this.y / 16);
        const tileY2 = Math.floor((this.y + this.height - 1) / 16);
        
        return !level.isSolid(tileX1, tileY1) && !level.isSolid(tileX2, tileY1) &&
               !level.isSolid(tileX1, tileY2) && !level.isSolid(tileX2, tileY2);
    }
    
    canMoveToY(newY, level) {
        const tileX1 = Math.floor(this.x / 16);
        const tileX2 = Math.floor((this.x + this.width - 1) / 16);
        const tileY1 = Math.floor(newY / 16);
        const tileY2 = Math.floor((newY + this.height - 1) / 16);
        
        return !level.isSolid(tileX1, tileY1) && !level.isSolid(tileX2, tileY1) &&
               !level.isSolid(tileX1, tileY2) && !level.isSolid(tileX2, tileY2);
    }
    
    update(deltaTime, level) {
        this.updateEffects(deltaTime);
        this.applyPhysics(deltaTime, level);
    }
    
    render(ctx, camera, assetManager) {
        // Override in subclasses
    }
}