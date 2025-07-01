import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 120;
        this.jumpPower = 200;
        this.health = 100;
        this.maxHealth = 100;
        
        // Física de plataformas
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 500;
        this.onGround = false;
        this.maxFallSpeed = 300;
        
        // Animación
        this.direction = 'right';
        this.animationFrame = 0;
        this.animationTime = 0;
        this.walkAnimationSpeed = 200;
        this.isMoving = false;
        
        // Efectos
        this.glowEffect = 0;
        this.jumpEffect = 0;
        
        // Controles
        this.canJump = true;
        this.jumpBufferTime = 0;
        this.coyoteTime = 0;
    }
    
    update(deltaTime, inputManager, level) {
        this.handleInput(inputManager, deltaTime);
        this.updatePhysics(deltaTime, level);
        this.updateAnimation(deltaTime);
        this.updateEffects(deltaTime);
        this.checkItemCollection(level);
    }
    
    handleInput(inputManager, deltaTime) {
        const moveSpeed = this.speed;
        this.isMoving = false;
        
        // Movimiento horizontal
        if (inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('KeyA')) {
            this.velocityX = -moveSpeed;
            this.direction = 'left';
            this.isMoving = true;
        } else if (inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('KeyD')) {
            this.velocityX = moveSpeed;
            this.direction = 'right';
            this.isMoving = true;
        } else {
            // Fricción
            this.velocityX *= 0.8;
            if (Math.abs(this.velocityX) < 5) {
                this.velocityX = 0;
            }
        }
        
        // Salto
        if (inputManager.isKeyPressed('Space') || inputManager.isKeyPressed('ArrowUp') || inputManager.isKeyPressed('KeyW')) {
            this.jumpBufferTime = 100; // Buffer de salto
        }
        
        if (this.jumpBufferTime > 0) {
            this.jumpBufferTime -= deltaTime;
            
            if ((this.onGround || this.coyoteTime > 0) && this.canJump) {
                this.velocityY = -this.jumpPower;
                this.onGround = false;
                this.canJump = false;
                this.jumpEffect = 200;
                this.jumpBufferTime = 0;
                this.coyoteTime = 0;
            }
        }
        
        // Reset del salto cuando se suelta la tecla
        if (!inputManager.isKeyPressed('Space') && !inputManager.isKeyPressed('ArrowUp') && !inputManager.isKeyPressed('KeyW')) {
            this.canJump = true;
        }
    }
    
    updatePhysics(deltaTime, level) {
        const dt = deltaTime / 1000;
        
        // Coyote time (permite saltar un poco después de dejar una plataforma)
        if (!this.onGround) {
            this.coyoteTime -= deltaTime;
        } else {
            this.coyoteTime = 100;
        }
        
        // Aplicar gravedad
        this.velocityY += this.gravity * dt;
        this.velocityY = Math.min(this.velocityY, this.maxFallSpeed);
        
        // Movimiento horizontal
        const newX = this.x + this.velocityX * dt;
        if (this.canMoveToX(newX, level)) {
            this.x = newX;
        } else {
            this.velocityX = 0;
        }
        
        // Movimiento vertical
        const newY = this.y + this.velocityY * dt;
        this.onGround = false;
        
        if (this.velocityY > 0) { // Cayendo
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                // Aterrizar en el suelo
                this.y = Math.floor(this.y / 16) * 16;
                this.velocityY = 0;
                this.onGround = true;
            }
        } else if (this.velocityY < 0) { // Subiendo
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                // Golpear el techo
                this.y = Math.ceil(this.y / 16) * 16;
                this.velocityY = 0;
            }
        }
        
        // Verificar si está en el suelo después del movimiento
        if (!this.onGround) {
            const groundY = this.y + 1;
            if (!this.canMoveToY(groundY, level)) {
                this.onGround = true;
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
    
    updateAnimation(deltaTime) {
        if (this.isMoving && this.onGround) {
            this.animationTime += deltaTime;
            if (this.animationTime > this.walkAnimationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.animationTime = 0;
            }
        } else {
            this.animationFrame = 0;
        }
    }
    
    updateEffects(deltaTime) {
        this.glowEffect += deltaTime * 0.005;
        if (this.glowEffect > Math.PI * 2) {
            this.glowEffect = 0;
        }
        
        if (this.jumpEffect > 0) {
            this.jumpEffect -= deltaTime;
        }
    }
    
    checkItemCollection(level) {
        const tileX = Math.floor((this.x + this.width / 2) / 16);
        const tileY = Math.floor((this.y + this.height / 2) / 16);
        
        const item = level.collectItem(tileX, tileY);
        if (item) {
            this.onItemCollected(item);
        }
    }
    
    onItemCollected(item) {
        // Emitir evento personalizado para que el juego maneje la puntuación
        const event = new CustomEvent('itemCollected', { detail: item });
        window.dispatchEvent(event);
        
        // Efectos según el tipo de item
        switch (item.type) {
            case 'potion_red':
                this.health = Math.min(this.maxHealth, this.health + 25);
                break;
            case 'potion_blue':
                // Podría ser velocidad temporal o algo así
                break;
        }
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    render(ctx) {
        // Usar sprites de Kenney
        let sprite = null;
        
        if (this.isMoving && this.animationFrame === 1 && this.onGround) {
            sprite = this.assetManager.getSprite('player_walk1');
        }
        
        if (!sprite) {
            sprite = this.assetManager.getSprite('player');
        }
        
        // Efecto de brillo sutil
        ctx.save();
        const glowIntensity = Math.sin(this.glowEffect) * 0.3 + 0.7;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 3 * glowIntensity;
        
        // Efecto de salto
        if (this.jumpEffect > 0) {
            ctx.shadowColor = '#87CEEB';
            ctx.shadowBlur = 6;
        }
        
        if (sprite) {
            // Voltear sprite según la dirección
            if (this.direction === 'left') {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
        } else {
            // Fallback
            ctx.fillStyle = this.onGround ? '#4ecdc4' : '#87CEEB';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Indicador de dirección
            ctx.fillStyle = '#FFD700';
            if (this.direction === 'right') {
                ctx.fillRect(this.x + 12, this.y + 6, 2, 4);
            } else {
                ctx.fillRect(this.x + 2, this.y + 6, 2, 4);
            }
        }
        
        ctx.restore();
        
        // Barra de vida
        this.renderHealthBar(ctx);
        
        // Efecto de aterrizaje
        if (this.jumpEffect > 0 && this.onGround) {
            ctx.save();
            ctx.globalAlpha = this.jumpEffect / 200;
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(this.x - 4, this.y + this.height, this.width + 8, 2);
            ctx.restore();
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = 20;
        const barHeight = 4;
        const barX = this.x - 2;
        const barY = this.y - 8;
        
        // Sombra de la barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY + 1, barWidth + 2, barHeight + 2);
        
        // Fondo de la barra
        ctx.fillStyle = '#2F1B14';
        ctx.fillRect(barX, barY, barWidth + 2, barHeight + 2);
        
        // Borde dorado
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth + 2, barHeight + 2);
        
        // Barra roja (daño)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(barX + 1, barY + 1, barWidth, barHeight);
        
        // Barra verde (vida actual)
        const healthPercent = this.health / this.maxHealth;
        const gradient = ctx.createLinearGradient(barX + 1, barY + 1, barX + 1 + barWidth, barY + 1);
        gradient.addColorStop(0, '#32CD32');
        gradient.addColorStop(1, '#228B22');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX + 1, barY + 1, barWidth * healthPercent, barHeight);
    }
}