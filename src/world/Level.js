export class Level {
    constructor(width, height, biome, assetManager) {
        this.width = width;
        this.height = height;
        this.biome = biome;
        this.assetManager = assetManager;
        this.tileSize = 16;
        
        // Level data
        this.tiles = [];
        this.backgroundTiles = [];
        this.decorations = [];
        this.items = [];
        this.enemies = [];
        this.checkpoints = [];
        this.secrets = [];
        
        // Biome properties
        this.biomeConfig = this.getBiomeConfig(biome);
        
        this.generateLevel();
    }
    
    getBiomeConfig(biome) {
        const configs = {
            forest: {
                groundTile: 'forest_ground',
                grassTile: 'forest_grass',
                wallTile: 'forest_tree_trunk',
                platformTile: 'forest_platform',
                backgroundColor: ['#87CEEB', '#98FB98', '#90EE90'],
                decorations: ['flower1', 'flower2', 'mushroom', 'vine'],
                enemies: ['enemy_goblin', 'enemy_slime'],
                music: 'forest_theme'
            },
            cave: {
                groundTile: 'cave_floor',
                grassTile: 'cave_floor',
                wallTile: 'cave_wall',
                platformTile: 'cave_wall',
                backgroundColor: ['#2F2F2F', '#1C1C1C', '#0F0F0F'],
                decorations: ['cave_crystal', 'cave_stalactite'],
                enemies: ['enemy_bat', 'enemy_spider'],
                music: 'cave_theme'
            },
            mountain: {
                groundTile: 'mountain_rock',
                grassTile: 'mountain_snow',
                wallTile: 'mountain_rock',
                platformTile: 'mountain_ice',
                backgroundColor: ['#B0C4DE', '#87CEEB', '#F0F8FF'],
                decorations: ['mountain_snow', 'mountain_ice'],
                enemies: ['enemy_orc', 'enemy_skeleton'],
                music: 'mountain_theme'
            }
        };
        
        return configs[biome] || configs.forest;
    }
    
    generateLevel() {
        this.initializeTiles();
        this.generateTerrain();
        this.addPlatforms();
        this.addDecorations();
        this.addItems();
        this.addEnemies();
        this.addCheckpoints();
        this.addSecrets();
    }
    
    initializeTiles() {
        // Initialize with air (0)
        this.tiles = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.backgroundTiles = Array(this.height).fill().map(() => Array(this.width).fill(0));
    }
    
    generateTerrain() {
        // Generate base terrain using Perlin noise simulation
        const groundLevel = this.height - 8;
        let currentHeight = 0;
        
        for (let x = 0; x < this.width; x++) {
            // Create height variation
            const noiseValue = this.noise(x * 0.02) * 6;
            currentHeight = Math.floor(groundLevel + noiseValue);
            
            // Ensure height is within bounds
            currentHeight = Math.max(5, Math.min(this.height - 3, currentHeight));
            
            // Fill from current height to bottom
            for (let y = currentHeight; y < this.height; y++) {
                if (y === currentHeight) {
                    this.tiles[y][x] = 1; // Surface
                } else {
                    this.tiles[y][x] = 2; // Underground
                }
            }
        }
        
        // Add caves and overhangs
        this.addCaves();
        this.addOverhangs();
    }
    
    addCaves() {
        const caveCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < caveCount; i++) {
            const caveX = 20 + Math.floor(Math.random() * (this.width - 40));
            const caveY = this.height - 15 + Math.floor(Math.random() * 10);
            const caveWidth = 8 + Math.floor(Math.random() * 12);
            const caveHeight = 4 + Math.floor(Math.random() * 6);
            
            // Carve out cave
            for (let x = caveX; x < caveX + caveWidth && x < this.width; x++) {
                for (let y = caveY; y < caveY + caveHeight && y < this.height; y++) {
                    this.tiles[y][x] = 0;
                }
            }
        }
    }
    
    addOverhangs() {
        for (let x = 10; x < this.width - 10; x += 20 + Math.floor(Math.random() * 20)) {
            const overhangY = this.findGroundLevel(x) - 8 - Math.floor(Math.random() * 8);
            const overhangWidth = 6 + Math.floor(Math.random() * 8);
            
            if (overhangY > 5) {
                for (let ox = x; ox < x + overhangWidth && ox < this.width; ox++) {
                    this.tiles[overhangY][ox] = 1;
                }
            }
        }
    }
    
    addPlatforms() {
        const platformCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < platformCount; i++) {
            const x = 10 + Math.floor(Math.random() * (this.width - 20));
            const y = 5 + Math.floor(Math.random() * (this.height - 15));
            const width = 3 + Math.floor(Math.random() * 6);
            
            // Check if platform placement is valid
            if (this.isValidPlatformPlacement(x, y, width)) {
                for (let px = x; px < x + width && px < this.width; px++) {
                    this.tiles[y][px] = 3; // Platform tile
                }
            }
        }
    }
    
    isValidPlatformPlacement(x, y, width) {
        // Check if there's enough space above and below
        for (let px = x; px < x + width && px < this.width; px++) {
            if (this.tiles[y][px] !== 0 || 
                (y > 0 && this.tiles[y - 1][px] !== 0) ||
                (y < this.height - 1 && this.tiles[y + 1][px] !== 0)) {
                return false;
            }
        }
        return true;
    }
    
    addDecorations() {
        this.decorations = [];
        
        // Add decorations based on biome
        const decorationTypes = this.biomeConfig.decorations;
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 1; y++) {
                // Add decorations on top of solid tiles
                if (this.tiles[y][x] === 1 && this.tiles[y - 1][x] === 0) {
                    if (Math.random() < 0.15) {
                        const decorationType = decorationTypes[Math.floor(Math.random() * decorationTypes.length)];
                        this.decorations.push({
                            type: decorationType,
                            x: x,
                            y: y - 1,
                            animationTime: Math.random() * 1000
                        });
                    }
                }
            }
        }
    }
    
    addItems() {
        this.items = [];
        
        // Add coins
        this.addItemType('coin', 30, 10);
        
        // Add gems
        this.addItemType('gem_blue', 8, 50);
        this.addItemType('gem_red', 6, 75);
        this.addItemType('gem_green', 4, 100);
        
        // Add potions
        this.addItemType('potion_health', 5, 0);
        this.addItemType('potion_energy', 3, 0);
        
        // Add power-ups
        this.addItemType('powerup_speed', 2, 0);
        this.addItemType('powerup_jump', 2, 0);
        this.addItemType('powerup_dash', 1, 0);
    }
    
    addItemType(type, count, value) {
        for (let i = 0; i < count; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
                attempts++;
            } while (attempts < 100 && (this.isSolid(x, y) || this.hasItemAt(x, y)));
            
            if (attempts < 100) {
                this.items.push({
                    type: type,
                    x: x,
                    y: y,
                    value: value,
                    collected: false,
                    animationTime: Math.random() * 1000,
                    floatOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    addEnemies() {
        this.enemies = [];
        const enemyTypes = this.biomeConfig.enemies;
        const enemyCount = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < enemyCount; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
                attempts++;
            } while (attempts < 100 && (this.isSolid(x, y) || !this.isSolid(x, y + 1)));
            
            if (attempts < 100) {
                const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                this.enemies.push({
                    type: enemyType,
                    x: x,
                    y: y
                });
            }
        }
    }
    
    addCheckpoints() {
        this.checkpoints = [];
        const checkpointCount = Math.floor(this.width / 100);
        
        for (let i = 1; i <= checkpointCount; i++) {
            const x = (this.width / (checkpointCount + 1)) * i;
            const y = this.findGroundLevel(x) - 1;
            
            this.checkpoints.push({
                x: Math.floor(x),
                y: y,
                activated: false
            });
        }
    }
    
    addSecrets() {
        this.secrets = [];
        const secretCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < secretCount; i++) {
            // Find hidden areas for secrets
            const x = 20 + Math.floor(Math.random() * (this.width - 40));
            const y = 10 + Math.floor(Math.random() * (this.height - 20));
            
            // Create a small secret room
            for (let sx = x; sx < x + 5 && sx < this.width; sx++) {
                for (let sy = y; sy < y + 3 && sy < this.height; sy++) {
                    this.tiles[sy][sx] = 0; // Clear space
                }
            }
            
            // Add valuable items in secret
            this.items.push({
                type: 'gem_red',
                x: x + 2,
                y: y + 1,
                value: 200,
                collected: false,
                animationTime: 0,
                floatOffset: 0,
                secret: true
            });
            
            this.secrets.push({
                x: x,
                y: y,
                width: 5,
                height: 3,
                discovered: false
            });
        }
    }
    
    findGroundLevel(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.tiles[y][x] === 1 || this.tiles[y][x] === 2) {
                return y;
            }
        }
        return this.height - 1;
    }
    
    hasItemAt(x, y) {
        return this.items.some(item => item.x === x && item.y === y && !item.collected);
    }
    
    isSolid(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }
        return this.tiles[y][x] > 0;
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 2; // Wall
        }
        return this.tiles[y][x];
    }
    
    getItemsInBounds(bounds) {
        const tileX1 = Math.floor(bounds.x / this.tileSize);
        const tileY1 = Math.floor(bounds.y / this.tileSize);
        const tileX2 = Math.floor((bounds.x + bounds.width) / this.tileSize);
        const tileY2 = Math.floor((bounds.y + bounds.height) / this.tileSize);
        
        return this.items.filter(item => 
            !item.collected &&
            item.x >= tileX1 && item.x <= tileX2 &&
            item.y >= tileY1 && item.y <= tileY2
        );
    }
    
    removeItem(item) {
        item.collected = true;
    }
    
    // Simple noise function for terrain generation
    noise(x) {
        x = (x << 13) ^ x;
        return (1.0 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
    }
    
    update(deltaTime) {
        // Update decorations
        this.decorations.forEach(decoration => {
            decoration.animationTime += deltaTime;
        });
        
        // Update items
        this.items.forEach(item => {
            item.animationTime += deltaTime;
        });
    }
    
    render(ctx, camera) {
        this.renderBackground(ctx, camera);
        this.renderTiles(ctx, camera);
        this.renderDecorations(ctx, camera);
        this.renderItems(ctx, camera);
        this.renderCheckpoints(ctx, camera);
    }
    
    renderBackground(ctx, camera) {
        // Create parallax background
        const colors = this.biomeConfig.backgroundColor;
        const gradient = ctx.createLinearGradient(0, 0, 0, camera.height);
        
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, camera.width, camera.height);
        
        // Add parallax elements (clouds, distant mountains, etc.)
        this.renderParallaxElements(ctx, camera);
    }
    
    renderParallaxElements(ctx, camera) {
        const parallaxOffset = camera.x * 0.1;
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        // Render background elements based on biome
        switch (this.biome) {
            case 'forest':
                this.renderForestBackground(ctx, camera, parallaxOffset);
                break;
            case 'cave':
                this.renderCaveBackground(ctx, camera, parallaxOffset);
                break;
            case 'mountain':
                this.renderMountainBackground(ctx, camera, parallaxOffset);
                break;
        }
        
        ctx.restore();
    }
    
    renderForestBackground(ctx, camera, offset) {
        // Render distant trees
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 10; i++) {
            const x = (i * 150 - offset) % (camera.width + 100);
            const y = camera.height - 200 + Math.sin(i) * 50;
            const height = 100 + Math.sin(i * 2) * 30;
            
            ctx.fillRect(x, y, 20, height);
        }
    }
    
    renderCaveBackground(ctx, camera, offset) {
        // Render cave formations
        ctx.fillStyle = '#444444';
        for (let i = 0; i < 8; i++) {
            const x = (i * 200 - offset * 0.5) % (camera.width + 150);
            const y = 50 + Math.sin(i * 1.5) * 30;
            const width = 40 + Math.sin(i) * 20;
            const height = 80 + Math.cos(i) * 40;
            
            ctx.fillRect(x, y, width, height);
        }
    }
    
    renderMountainBackground(ctx, camera, offset) {
        // Render distant mountains
        ctx.fillStyle = '#708090';
        for (let i = 0; i < 6; i++) {
            const x = (i * 250 - offset * 0.3) % (camera.width + 200);
            const y = camera.height - 300;
            const width = 150 + Math.sin(i) * 50;
            const height = 200 + Math.cos(i * 2) * 80;
            
            // Draw mountain shape
            ctx.beginPath();
            ctx.moveTo(x, camera.height);
            ctx.lineTo(x + width / 2, y);
            ctx.lineTo(x + width, camera.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    renderTiles(ctx, camera) {
        const bounds = camera.getViewBounds();
        const startX = Math.max(0, Math.floor(bounds.left / this.tileSize));
        const startY = Math.max(0, Math.floor(bounds.top / this.tileSize));
        const endX = Math.min(this.width, Math.ceil(bounds.right / this.tileSize));
        const endY = Math.min(this.height, Math.ceil(bounds.bottom / this.tileSize));
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tileType = this.getTile(x, y);
                if (tileType > 0) {
                    this.renderTile(ctx, camera, tileType, x, y);
                }
            }
        }
    }
    
    renderTile(ctx, camera, tileType, tileX, tileY) {
        const worldX = tileX * this.tileSize;
        const worldY = tileY * this.tileSize;
        const screenPos = camera.worldToScreen(worldX, worldY);
        
        let spriteName = '';
        switch (tileType) {
            case 1: // Surface
                spriteName = this.biomeConfig.groundTile;
                break;
            case 2: // Underground
                spriteName = this.biomeConfig.wallTile;
                break;
            case 3: // Platform
                spriteName = this.biomeConfig.platformTile;
                break;
        }
        
        const sprite = this.assetManager.getSprite(spriteName);
        
        if (sprite) {
            ctx.drawImage(sprite, screenPos.x, screenPos.y, this.tileSize, this.tileSize);
        } else {
            // Fallback rendering
            this.renderFallbackTile(ctx, screenPos, tileType);
        }
    }
    
    renderFallbackTile(ctx, screenPos, tileType) {
        switch (tileType) {
            case 1: // Surface
                ctx.fillStyle = this.biome === 'cave' ? '#654321' : '#8B4513';
                ctx.fillRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                if (this.biome !== 'cave') {
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(screenPos.x, screenPos.y, this.tileSize, 2);
                }
                break;
            case 2: // Underground
                ctx.fillStyle = this.biome === 'cave' ? '#2F2F2F' : '#654321';
                ctx.fillRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                break;
            case 3: // Platform
                ctx.fillStyle = this.biome === 'mountain' ? '#87CEEB' : '#8B4513';
                ctx.fillRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                break;
        }
    }
    
    renderDecorations(ctx, camera) {
        this.decorations.forEach(decoration => {
            const worldX = decoration.x * this.tileSize;
            const worldY = decoration.y * this.tileSize;
            
            if (camera.isVisible(worldX, worldY, this.tileSize, this.tileSize)) {
                const screenPos = camera.worldToScreen(worldX, worldY);
                this.renderDecoration(ctx, decoration, screenPos);
            }
        });
    }
    
    renderDecoration(ctx, decoration, screenPos) {
        const sprite = this.assetManager.getSprite(decoration.type);
        
        if (sprite) {
            // Add animation for certain decorations
            if (decoration.type === 'torch') {
                ctx.save();
                ctx.shadowColor = '#FF6347';
                ctx.shadowBlur = 8 + Math.sin(decoration.animationTime * 0.01) * 2;
                ctx.drawImage(sprite, screenPos.x, screenPos.y, this.tileSize, this.tileSize);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, screenPos.x, screenPos.y, this.tileSize, this.tileSize);
            }
        } else {
            // Fallback decoration rendering
            this.renderFallbackDecoration(ctx, decoration, screenPos);
        }
    }
    
    renderFallbackDecoration(ctx, decoration, screenPos) {
        switch (decoration.type) {
            case 'flower1':
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(screenPos.x + 6, screenPos.y + 6, 4, 4);
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(screenPos.x + 7, screenPos.y + 10, 2, 6);
                break;
            case 'flower2':
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenPos.x + 6, screenPos.y + 6, 4, 4);
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(screenPos.x + 7, screenPos.y + 10, 2, 6);
                break;
            case 'mushroom':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(screenPos.x + 7, screenPos.y + 8, 2, 8);
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(screenPos.x + 4, screenPos.y + 4, 8, 6);
                break;
        }
    }
    
    renderItems(ctx, camera) {
        this.items.forEach(item => {
            if (!item.collected) {
                const floatOffset = Math.sin(item.animationTime * 0.003 + item.floatOffset) * 2;
                const worldX = item.x * this.tileSize;
                const worldY = item.y * this.tileSize + floatOffset;
                
                if (camera.isVisible(worldX, worldY, this.tileSize, this.tileSize)) {
                    const screenPos = camera.worldToScreen(worldX, worldY);
                    this.renderItem(ctx, item, screenPos);
                }
            }
        });
    }
    
    renderItem(ctx, item, screenPos) {
        const sprite = this.assetManager.getSprite(item.type);
        
        ctx.save();
        
        // Add glow effect for valuable items
        if (item.type.includes('gem') || item.secret) {
            const glowIntensity = Math.sin(item.animationTime * 0.005) * 0.5 + 0.5;
            ctx.shadowColor = item.type === 'gem_blue' ? '#4169E1' : 
                             item.type === 'gem_red' ? '#DC143C' : '#32CD32';
            ctx.shadowBlur = 8 * glowIntensity;
        } else if (item.type === 'coin') {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 4;
        }
        
        if (sprite) {
            ctx.drawImage(sprite, screenPos.x, screenPos.y, this.tileSize, this.tileSize);
        } else {
            // Fallback item rendering
            this.renderFallbackItem(ctx, item, screenPos);
        }
        
        ctx.restore();
    }
    
    renderFallbackItem(ctx, item, screenPos) {
        switch (item.type) {
            case 'coin':
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(screenPos.x + 4, screenPos.y + 4, 8, 8);
                break;
            case 'gem_blue':
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(screenPos.x + 4, screenPos.y + 4, 8, 8);
                break;
            case 'gem_red':
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(screenPos.x + 4, screenPos.y + 4, 8, 8);
                break;
            case 'gem_green':
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(screenPos.x + 4, screenPos.y + 4, 8, 8);
                break;
        }
    }
    
    renderCheckpoints(ctx, camera) {
        this.checkpoints.forEach(checkpoint => {
            const worldX = checkpoint.x * this.tileSize;
            const worldY = checkpoint.y * this.tileSize;
            
            if (camera.isVisible(worldX, worldY, this.tileSize, this.tileSize * 2)) {
                const screenPos = camera.worldToScreen(worldX, worldY);
                
                ctx.save();
                ctx.fillStyle = checkpoint.activated ? '#00ff00' : '#ffff00';
                ctx.shadowColor = checkpoint.activated ? '#00ff00' : '#ffff00';
                ctx.shadowBlur = 10;
                
                // Draw checkpoint flag
                ctx.fillRect(screenPos.x + 2, screenPos.y - 16, 2, 32);
                ctx.fillRect(screenPos.x + 4, screenPos.y - 16, 8, 8);
                
                ctx.restore();
            }
        });
    }
}