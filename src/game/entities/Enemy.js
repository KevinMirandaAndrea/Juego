import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 30; // más lento que el jugador
        this.health = 20;
        this.damage = 5;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // ms
        this.detectionRange = 80;
        this.direction = Math.random() * Math.PI * 2;
        this.wanderTime = 0;
        this.state = 'wandering'; // wandering, chasing, attacking
    }
    
    update(deltaTime, player, dungeon) {
        const distanceToPlayer = this.distanceTo(player);
        
        if (distanceToPlayer < this.detectionRange) {
            this.state = 'chasing';
            this.chasePlayer(player, deltaTime);
        } else {
            this.state = 'wandering';
            this.wander(deltaTime);
        }
        
        this.updatePosition(deltaTime, dungeon);
    }
    
    chasePlayer(player, deltaTime) {
        const playerCenter = player.getCenter();
        const enemyCenter = this.getCenter();
        
        const dx = playerCenter.x - enemyCenter.x;
        const dy = playerCenter.y - enemyCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveSpeed = this.speed * (deltaTime / 1000);
            this.targetX = this.x + (dx / distance) * moveSpeed;
            this.targetY = this.y + (dy / distance) * moveSpeed;
        }
    }
    
    wander(deltaTime) {
        this.wanderTime += deltaTime;
        
        if (this.wanderTime > 2000) { // Cambiar dirección cada 2 segundos
            this.direction = Math.random() * Math.PI * 2;
            this.wanderTime = 0;
        }
        
        const moveSpeed = this.speed * 0.5 * (deltaTime / 1000); // Más lento al vagar
        this.targetX = this.x + Math.cos(this.direction) * moveSpeed;
        this.targetY = this.y + Math.sin(this.direction) * moveSpeed;
    }
    
    updatePosition(deltaTime, dungeon) {
        // Verificar colisiones con paredes
        const tileX = Math.floor(this.targetX / 16);
        const tileY = Math.floor(this.targetY / 16);
        
        if (!dungeon.isWall(tileX, tileY)) {
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            // Si choca con una pared, cambiar dirección
            this.direction = Math.random() * Math.PI * 2;
        }
    }
    
    render(ctx) {
        // Renderizar sprite del enemigo
        const sprite = this.assetManager.getSprite('enemy');
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback si no hay sprite
            ctx.fillStyle = this.state === 'chasing' ? '#ff4757' : '#ff6b6b';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Indicador de estado
        if (this.state === 'chasing') {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x + 6, this.y - 4, 4, 2);
        }
    }
}