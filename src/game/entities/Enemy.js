import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        this.speed = 30;
        this.health = 20;
        this.damage = 5;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        this.detectionRange = 80;
        this.direction = Math.random() * Math.PI * 2;
        this.wanderTime = 0;
        this.state = 'wandering';
        this.enemyType = this.getRandomEnemyType();
        this.animationTime = 0;
        this.animationFrame = 0;
    }
    
    getRandomEnemyType() {
        const types = ['enemy_orc', 'enemy_skeleton', 'enemy_goblin', 'enemy_bat', 'enemy_spider', 'enemy_slime'];
        return types[Math.floor(Math.random() * types.length)];
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
        this.updateAnimation(deltaTime);
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
        
        if (this.wanderTime > 2000) {
            this.direction = Math.random() * Math.PI * 2;
            this.wanderTime = 0;
        }
        
        const moveSpeed = this.speed * 0.5 * (deltaTime / 1000);
        this.targetX = this.x + Math.cos(this.direction) * moveSpeed;
        this.targetY = this.y + Math.sin(this.direction) * moveSpeed;
    }
    
    updatePosition(deltaTime, dungeon) {
        const tileX = Math.floor(this.targetX / 16);
        const tileY = Math.floor(this.targetY / 16);
        
        if (!dungeon.isWall(tileX, tileY)) {
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            this.direction = Math.random() * Math.PI * 2;
        }
    }
    
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        if (this.animationTime > 500) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTime = 0;
        }
    }
    
    render(ctx) {
        // Usar sprite específico del tipo de enemigo
        const sprite = this.assetManager.getSprite(this.enemyType);
        
        if (sprite) {
            // Efecto visual cuando está persiguiendo
            if (this.state === 'chasing') {
                ctx.save();
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 4;
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
        } else {
            // Fallback
            ctx.fillStyle = this.state === 'chasing' ? '#ff4757' : '#ff6b6b';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Indicador de estado
        if (this.state === 'chasing') {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x + 6, this.y - 3, 4, 2);
        }
    }
}