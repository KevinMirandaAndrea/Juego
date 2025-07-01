import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y, assetManager) {
        super(x, y, 16, 16);
        this.assetManager = assetManager;
        
        // Movement properties
        this.speed = 150;
        this.jumpPower = 300;
        this.dashPower = 400;
        this.wallJumpPower = 250;
        
        // Abilities
        this.canDash = true;
        this.canWallJump = true;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        
        // Wall jumping
        this.wallSliding = false;
        this.wallDirection = 0;
        this.wallSlideSpeed = 50;
        
        // Coyote time and jump buffering
        this.coyoteTime = 0;
        this.jumpBuffer = 0;
        this.maxCoyoteTime = 100;
        this.maxJumpBuffer = 100;
        
        // Power-ups
        this.powerUps = {
            speedBoost: 0,
            jumpBoost: 0,
            dashBoost: 0
        };
        
        // Visual effects
        this.trailParticles = [];
        this.landingEffect = 0;
        this.glowIntensity = 0;
        
        // Stats
        this.score = 0;
        this.gemsCollected = 0;
        this.coinsCollected = 0;
    }
    
    update(deltaTime, inputManager, level, camera) {
        this.updateTimers(deltaTime);
        this.handleInput(inputManager, deltaTime);
        this.updateAbilities(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateVisualEffects(deltaTime);
        
        super.update(deltaTime, level);
        
        this.checkItemCollection(level);
        this.updateUI();
        
        // Update camera shake on landing
        if (this.onGround && this.landingEffect > 0) {
            camera.addShake(2, 100);
        }
    }
    
    updateTimers(deltaTime) {
        // Coyote time
        if (this.onGround) {
            this.coyoteTime = this.maxCoyoteTime;
        } else {
            this.coyoteTime = Math.max(0, this.coyoteTime - deltaTime);
        }
        
        // Jump buffer
        this.jumpBuffer = Math.max(0, this.jumpBuffer - deltaTime);
        
        // Dash cooldown
        this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
        this.dashDuration = Math.max(0, this.dashDuration - deltaTime);
        
        // Energy regeneration
        if (this.energy < this.maxEnergy && this.dashCooldown <= 0) {
            this.energy = Math.min(this.maxEnergy, this.energy + deltaTime * 0.05);
        }
    }
    
    handleInput(inputManager, deltaTime) {
        const horizontal = inputManager.getHorizontalInput();
        
        // Horizontal movement
        if (horizontal !== 0) {
            this.facing = horizontal;
            
            let moveSpeed = this.speed;
            if (this.powerUps.speedBoost > 0) {
                moveSpeed *= 1.5;
            }
            
            if (this.dashDuration > 0) {
                this.velocityX = this.facing * this.dashPower;
            } else if (!this.wallSliding) {
                this.velocityX = horizontal * moveSpeed;
            }
            
            this.animationState = this.onGround ? 'walk' : 'jump';
        } else {
            if (this.onGround && this.dashDuration <= 0) {
                this.animationState = 'idle';
            }
        }
        
        // Jump input
        if (inputManager.getJumpInput()) {
            this.jumpBuffer = this.maxJumpBuffer;
        }
        
        // Jump execution
        if (this.jumpBuffer > 0 && (this.coyoteTime > 0 || this.wallSliding)) {
            this.jump();
            this.jumpBuffer = 0;
        }
        
        // Dash input
        if (inputManager.getDashInput() && this.canDash && this.dashCooldown <= 0 && this.energy >= 25) {
            this.dash();
        }
        
        // Wall jump logic
        this.updateWallSliding(inputManager, deltaTime);
    }
    
    jump() {
        let jumpPower = this.jumpPower;
        if (this.powerUps.jumpBoost > 0) {
            jumpPower *= 1.3;
        }
        
        if (this.wallSliding) {
            // Wall jump
            this.velocityY = -this.wallJumpPower;
            this.velocityX = -this.wallDirection * this.wallJumpPower * 0.8;
            this.wallSliding = false;
        } else {
            // Regular jump
            this.velocityY = -jumpPower;
        }
        
        this.onGround = false;
        this.coyoteTime = 0;
        this.animationState = 'jump';
        
        // Visual effect
        this.addJumpEffect();
        this.assetManager.playSound('jump');
    }
    
    dash() {
        this.dashDuration = 200;
        this.dashCooldown = 800;
        this.energy -= 25;
        this.velocityY *= 0.5; // Reduce fall speed during dash
        
        // Add dash particles
        this.addDashEffect();
        this.assetManager.playSound('dash');
    }
    
    updateWallSliding(inputManager, deltaTime) {
        this.wallSliding = false;
        this.wallDirection = 0;
        
        if (!this.onGround && this.velocityY > 0) {
            // Check for walls
            const leftWall = this.checkWall(-1);
            const rightWall = this.checkWall(1);
            
            if ((leftWall && inputManager.isKeyPressed('KeyA')) || 
                (rightWall && inputManager.isKeyPressed('KeyD'))) {
                
                this.wallSliding = true;
                this.wallDirection = leftWall ? -1 : 1;
                this.velocityY = Math.min(this.velocityY, this.wallSlideSpeed);
                this.animationState = 'wallSlide';
            }
        }
    }
    
    checkWall(direction) {
        // Check if there's a wall in the given direction
        const checkX = direction > 0 ? this.x + this.width : this.x - 1;
        const tileX = Math.floor(checkX / 16);
        const tileY1 = Math.floor(this.y / 16);
        const tileY2 = Math.floor((this.y + this.height - 1) / 16);
        
        // This would need access to the level - simplified for now
        return false; // Placeholder
    }
    
    updateAbilities(deltaTime) {
        // Update dash state
        if (this.dashDuration > 0) {
            this.gravity = 0; // No gravity during dash
        } else {
            this.gravity = 800; // Normal gravity
        }
    }
    
    updatePowerUps(deltaTime) {
        Object.keys(this.powerUps).forEach(key => {
            if (this.powerUps[key] > 0) {
                this.powerUps[key] = Math.max(0, this.powerUps[key] - deltaTime);
            }
        });
    }
    
    updateVisualEffects(deltaTime) {
        // Update trail particles
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
        
        // Add trail particles during dash
        if (this.dashDuration > 0) {
            this.addTrailParticle();
        }
        
        // Update landing effect
        if (this.landingEffect > 0) {
            this.landingEffect -= deltaTime;
        }
        
        // Update glow effect
        this.glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    }
    
    addJumpEffect() {
        this.landingEffect = 300;
        
        // Add jump particles
        for (let i = 0; i < 5; i++) {
            this.trailParticles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height,
                vx: (Math.random() - 0.5) * 100,
                vy: Math.random() * 50,
                life: 500,
                maxLife: 500,
                alpha: 1,
                color: '#00d4ff'
            });
        }
    }
    
    addDashEffect() {
        // Add dash particles
        for (let i = 0; i < 10; i++) {
            this.trailParticles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 300,
                maxLife: 300,
                alpha: 1,
                color: '#00ff88'
            });
        }
    }
    
    addTrailParticle() {
        this.trailParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: -this.facing * 50,
            vy: (Math.random() - 0.5) * 20,
            life: 200,
            maxLife: 200,
            alpha: 1,
            color: '#00d4ff'
        });
    }
    
    checkItemCollection(level) {
        const bounds = this.getBounds();
        const items = level.getItemsInBounds(bounds);
        
        items.forEach(item => {
            if (!item.collected) {
                this.collectItem(item);
                level.removeItem(item);
            }
        });
    }
    
    collectItem(item) {
        switch (item.type) {
            case 'coin':
                this.score += 10;
                this.coinsCollected++;
                break;
            case 'gem_blue':
            case 'gem_red':
            case 'gem_green':
                this.score += 50;
                this.gemsCollected++;
                break;
            case 'potion_health':
                this.heal(25);
                break;
            case 'potion_energy':
                this.energy = this.maxEnergy;
                break;
            case 'powerup_speed':
                this.powerUps.speedBoost = 10000; // 10 seconds
                break;
            case 'powerup_jump':
                this.powerUps.jumpBoost = 10000;
                break;
            case 'powerup_dash':
                this.powerUps.dashBoost = 10000;
                break;
        }
        
        this.assetManager.playSound('collect');
    }
    
    updateUI() {
        // Update health bar
        const healthPercent = (this.health / this.maxHealth) * 100;
        const healthFill = document.getElementById('healthFill');
        const healthText = document.getElementById('healthText');
        if (healthFill) healthFill.style.width = `${healthPercent}%`;
        if (healthText) healthText.textContent = `${Math.ceil(this.health)}/${this.maxHealth}`;
        
        // Update energy bar
        const energyPercent = (this.energy / this.maxEnergy) * 100;
        const energyFill = document.getElementById('energyFill');
        if (energyFill) energyFill.style.width = `${energyPercent}%`;
        
        // Update score
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = this.score;
    }
    
    render(ctx, camera, assetManager) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Render trail particles
        this.renderTrailParticles(ctx, camera);
        
        // Get appropriate sprite
        let sprite = null;
        switch (this.animationState) {
            case 'walk':
                sprite = assetManager.getAnimationFrame('player_walk', this.animationTime);
                break;
            case 'jump':
                sprite = assetManager.getSprite('player_jump');
                break;
            case 'wallSlide':
                sprite = assetManager.getSprite('player_fall');
                break;
            default:
                sprite = assetManager.getSprite('player_idle');
        }
        
        if (!sprite) {
            sprite = assetManager.getSprite('player_idle');
        }
        
        // Apply visual effects
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 5 * this.glowIntensity;
        
        // Dash effect
        if (this.dashDuration > 0) {
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8;
        }
        
        // Power-up effects
        if (this.powerUps.speedBoost > 0) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
        }
        
        if (sprite) {
            // Flip sprite based on facing direction
            if (this.facing < 0) {
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -screenPos.x - this.width, screenPos.y, this.width, this.height);
            } else {
                ctx.drawImage(sprite, screenPos.x, screenPos.y, this.width, this.height);
            }
        } else {
            // Fallback rendering
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        }
        
        ctx.restore();
        
        // Render landing effect
        if (this.landingEffect > 0) {
            this.renderLandingEffect(ctx, camera);
        }
    }
    
    renderTrailParticles(ctx, camera) {
        this.trailParticles.forEach(particle => {
            const screenPos = camera.worldToScreen(particle.x, particle.y);
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            ctx.fillRect(screenPos.x - 1, screenPos.y - 1, 2, 2);
            ctx.restore();
        });
    }
    
    renderLandingEffect(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y + this.height);
        const alpha = this.landingEffect / 300;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        
        // Draw expanding circle effect
        const radius = (1 - alpha) * 20;
        ctx.beginPath();
        ctx.arc(screenPos.x + this.width / 2, screenPos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}