import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 60;
        this.health = 20;
        this.damage = 10;
        
        // Física de plataformas
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 500;
        this.onGround = false;
        this.maxFallSpeed = 300;
        
        // IA
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.patrolDistance = 64 + Math.random() * 64;
        this.startX = x;
        this.detectionRange = 80;
        this.state = 'patrolling'; // patrolling, chasing, attacking
        this.stateTime = 0;
        
        // Animación
        this.animationTime = 0;
        this.animationFrame = 0;
        this.enemyType = this.getRandomEnemyType();
        
        // Combate
        this.lastAttackTime = 0;
        this.attackCooldown = 1500;
    }
    
    getRandomEnemyType() {
        const types = ['enemy_orc', 'enemy_skeleton', 'enemy_goblin', 'enemy_slime'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    update(deltaTime, player, level) {
        this.stateTime += deltaTime;
        
        const distanceToPlayer = this.distanceTo(player);
        
        // Cambio de estado basado en la distancia al jugador
        if (distanceToPlayer < this.detectionRange && this.canSeePlayer(player, level)) {
            if (distanceToPlayer < 20) {
                this.state = 'attacking';
            } else {
                this.state = 'chasing';
            }
        } else {
            this.state = 'patrolling';
        }
        
        this.updateAI(deltaTime, player, level);
        this.updatePhysics(deltaTime, level);
        this.updateAnimation(deltaTime);
        this.checkPlayerCollision(player);
    }
    
    updateAI(deltaTime, player, level) {
        switch (this.state) {
            case 'patrolling':
                this.patrol(deltaTime);
                break;
            case 'chasing':
                this.chasePlayer(player, deltaTime);
                break;
            case 'attacking':
                this.attackPlayer(player, deltaTime);
                break;
        }
    }
    
    patrol(deltaTime) {
        // Patrullar de un lado a otro
        const distanceFromStart = Math.abs(this.x - this.startX);
        
        if (distanceFromStart > this.patrolDistance) {
            this.direction *= -1;
        }
        
        // Cambiar dirección si hay una pared o precipicio
        if (!this.canMoveInDirection(this.direction)) {
            this.direction *= -1;
        }
        
        this.velocityX = this.direction * this.speed * 0.5;
    }
    
    chasePlayer(player, deltaTime) {
        const playerCenter = player.getCenter();
        const enemyCenter = this.getCenter();
        
        if (playerCenter.x < enemyCenter.x) {
            this.direction = -1;
        } else {
            this.direction = 1;
        }
        
        this.velocityX = this.direction * this.speed;
        
        // Saltar si el jugador está arriba
        if (playerCenter.y < enemyCenter.y - 20 && this.onGround) {
            this.velocityY = -150;
            this.onGround = false;
        }
    }
    
    attackPlayer(player, deltaTime) {
        this.velocityX = 0; // Detenerse para atacar
        
        if (this.stateTime > this.attackCooldown) {
            // Realizar ataque
            player.takeDamage(this.damage);
            this.stateTime = 0;
        }
    }
    
    canMoveInDirection(dir) {
        const nextX = this.x + dir * 20;
        const groundY = this.y + this.height + 5;
        
        // Verificar si hay suelo adelante (evitar precipicios)
        const tileX = Math.floor(nextX / 16);
        const tileY = Math.floor(groundY / 16);
        
        return tileY < 30; // Límite del nivel
    }
    
    canSeePlayer(player, level) {
        // Verificación simple de línea de vista
        const playerCenter = player.getCenter();
        const enemyCenter = this.getCenter();
        
        const dx = playerCenter.x - enemyCenter.x;
        const dy = playerCenter.y - enemyCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return true;
        
        const steps = Math.floor(distance / 8);
        const stepX = dx / steps;
        const stepY = dy / steps;
        
        for (let i = 0; i < steps; i++) {
            const checkX = enemyCenter.x + stepX * i;
            const checkY = enemyCenter.y + stepY * i;
            const tileX = Math.floor(checkX / 16);
            const tileY = Math.floor(checkY / 16);
            
            if (level.isSolid(tileX, tileY)) {
                return false;
            }
        }
        
        return true;
    }
    
    updatePhysics(deltaTime, level) {
        const dt = deltaTime / 1000;
        
        // Aplicar gravedad
        this.velocityY += this.gravity * dt;
        this.velocityY = Math.min(this.velocityY, this.maxFallSpeed);
        
        // Movimiento horizontal
        const newX = this.x + this.velocityX * dt;
        if (this.canMoveToX(newX, level)) {
            this.x = newX;
        } else {
            this.velocityX = 0;
            this.direction *= -1; // Cambiar dirección si choca con pared
        }
        
        // Movimiento vertical
        const newY = this.y + this.velocityY * dt;
        this.onGround = false;
        
        if (this.velocityY > 0) { // Cayendo
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                this.y = Math.floor(this.y / 16) * 16;
                this.velocityY = 0;
                this.onGround = true;
            }
        } else if (this.velocityY < 0) { // Subiendo
            if (this.canMoveToY(newY, level)) {
                this.y = newY;
            } else {
                this.y = Math.ceil(this.y / 16) * 16;
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
    
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        if (this.animationTime > 400) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTime = 0;
        }
    }
    
    checkPlayerCollision(player) {
        if (this.getBounds().intersects(player.getBounds())) {
            // El jugador puede saltar sobre el enemigo para derrotarlo
            if (player.velocityY > 0 && player.y < this.y) {
                this.health = 0;
                player.velocityY = -100; // Pequeño rebote
                
                // Emitir evento de enemigo derrotado
                const event = new CustomEvent('enemyDefeated', { detail: this });
                window.dispatchEvent(event);
            }
        }
    }
    
    render(ctx) {
        const sprite = this.assetManager.getSprite(this.enemyType);
        
        if (sprite) {
            // Efecto visual según el estado
            if (this.state === 'chasing') {
                ctx.save();
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 4;
            } else if (this.state === 'attacking') {
                ctx.save();
                ctx.shadowColor = '#ff3838';
                ctx.shadowBlur = 6;
            }
            
            // Voltear sprite según la dirección
            if (this.direction < 0) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
            
            if (this.state === 'chasing' || this.state === 'attacking') {
                ctx.restore();
            }
        } else {
            // Fallback
            ctx.fillStyle = this.state === 'chasing' ? '#ff4757' : 
                           this.state === 'attacking' ? '#ff3838' : '#ff6b6b';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Indicador de dirección
            ctx.fillStyle = '#fff';
            if (this.direction > 0) {
                ctx.fillRect(this.x + 12, this.y + 6, 2, 4);
            } else {
                ctx.fillRect(this.x + 2, this.y + 6, 2, 4);
            }
        }
        
        // Indicador de estado
        if (this.state === 'chasing') {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x + 6, this.y - 3, 4, 2);
        } else if (this.state === 'attacking') {
            ctx.fillStyle = '#ff3838';
            ctx.fillRect(this.x + 4, this.y - 3, 8, 2);
        }
    }
}