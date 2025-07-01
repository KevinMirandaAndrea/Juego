export class Level {
    constructor(width, height, assetManager) {
        this.width = width;
        this.height = height;
        this.assetManager = assetManager;
        this.tileSize = 16;
        this.tiles = [];
        this.platforms = [];
        this.items = [];
        this.enemies = [];
        this.decorations = [];
        
        this.generateLevel();
    }
    
    generateLevel() {
        // Inicializar con aire (0)
        this.tiles = Array(this.height).fill().map(() => Array(this.width).fill(0));
        
        this.createTerrain();
        this.addPlatforms();
        this.addItems();
        this.addDecorations();
        this.addEnemySpawns();
    }
    
    createTerrain() {
        // Crear el suelo base
        const groundLevel = this.height - 4;
        
        // Suelo principal
        for (let x = 0; x < this.width; x++) {
            for (let y = groundLevel; y < this.height; y++) {
                if (y === groundLevel) {
                    this.tiles[y][x] = 1; // Superficie de tierra
                } else {
                    this.tiles[y][x] = 2; // Tierra sólida
                }
            }
        }
        
        // Crear colinas y variaciones del terreno
        this.createHills(groundLevel);
        
        // Crear algunas cuevas y túneles
        this.createCaves(groundLevel);
    }
    
    createHills(baseGroundLevel) {
        let currentHeight = 0;
        
        for (let x = 0; x < this.width; x++) {
            // Crear variaciones suaves en el terreno
            if (Math.random() < 0.1) {
                currentHeight += Math.random() < 0.5 ? 1 : -1;
                currentHeight = Math.max(-3, Math.min(3, currentHeight));
            }
            
            const groundLevel = baseGroundLevel + currentHeight;
            
            // Limpiar el área sobre el nuevo nivel del suelo
            for (let y = 0; y < groundLevel; y++) {
                this.tiles[y][x] = 0;
            }
            
            // Establecer el nuevo suelo
            for (let y = groundLevel; y < this.height; y++) {
                if (y === groundLevel) {
                    this.tiles[y][x] = 1; // Superficie
                } else {
                    this.tiles[y][x] = 2; // Tierra sólida
                }
            }
        }
    }
    
    createCaves(groundLevel) {
        // Crear algunas cuevas pequeñas
        for (let i = 0; i < 3; i++) {
            const caveX = 10 + Math.floor(Math.random() * (this.width - 20));
            const caveY = groundLevel + 1;
            const caveWidth = 3 + Math.floor(Math.random() * 4);
            const caveHeight = 2 + Math.floor(Math.random() * 2);
            
            for (let x = caveX; x < caveX + caveWidth && x < this.width; x++) {
                for (let y = caveY; y < caveY + caveHeight && y < this.height; y++) {
                    this.tiles[y][x] = 0; // Aire
                }
            }
        }
    }
    
    addPlatforms() {
        // Añadir plataformas flotantes
        const platformCount = 8 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < platformCount; i++) {
            const x = 5 + Math.floor(Math.random() * (this.width - 15));
            const y = 5 + Math.floor(Math.random() * (this.height - 15));
            const width = 3 + Math.floor(Math.random() * 5);
            
            // Verificar que no esté muy cerca del suelo
            if (y < this.height - 8) {
                for (let px = x; px < x + width && px < this.width; px++) {
                    this.tiles[y][px] = 3; // Plataforma
                }
            }
        }
        
        // Añadir algunas plataformas verticales (paredes)
        for (let i = 0; i < 4; i++) {
            const x = 8 + Math.floor(Math.random() * (this.width - 16));
            const y = 8 + Math.floor(Math.random() * (this.height - 16));
            const height = 3 + Math.floor(Math.random() * 4);
            
            for (let py = y; py < y + height && py < this.height; py++) {
                this.tiles[py][x] = 1; // Pared
            }
        }
    }
    
    addItems() {
        this.items = [];
        
        // Añadir monedas
        for (let i = 0; i < 20; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
            } while (this.isSolid(x, y) || this.hasItemAt(x, y));
            
            this.items.push({
                type: 'coin',
                x: x,
                y: y,
                collected: false
            });
        }
        
        // Añadir gemas (más valiosas)
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
            } while (this.isSolid(x, y) || this.hasItemAt(x, y));
            
            const gemTypes = ['gem_blue', 'gem_red', 'gem_green'];
            const randomGem = gemTypes[Math.floor(Math.random() * gemTypes.length)];
            
            this.items.push({
                type: randomGem,
                x: x,
                y: y,
                collected: false,
                value: 50
            });
        }
        
        // Añadir power-ups
        for (let i = 0; i < 5; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
            } while (this.isSolid(x, y) || this.hasItemAt(x, y));
            
            const powerUpTypes = ['potion_red', 'potion_blue'];
            const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            this.items.push({
                type: randomPowerUp,
                x: x,
                y: y,
                collected: false
            });
        }
    }
    
    addDecorations() {
        this.decorations = [];
        
        // Añadir flores y plantas en el suelo
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 1; y++) {
                if (this.tiles[y][x] === 1 && this.tiles[y - 1][x] === 0) {
                    if (Math.random() < 0.1) {
                        this.decorations.push({
                            type: Math.random() < 0.5 ? 'flower1' : 'flower2',
                            x: x,
                            y: y - 1
                        });
                    }
                }
            }
        }
        
        // Añadir antorchas en paredes
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                if (this.tiles[y][x] === 1 && this.tiles[y][x - 1] === 0 && Math.random() < 0.05) {
                    this.decorations.push({
                        type: 'torch',
                        x: x - 1,
                        y: y
                    });
                }
            }
        }
    }
    
    addEnemySpawns() {
        // Posiciones donde pueden aparecer enemigos
        this.enemySpawns = [];
        
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * (this.height - 5));
            } while (this.isSolid(x, y) || !this.isSolid(x, y + 1));
            
            this.enemySpawns.push({ x, y });
        }
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
            return 1;
        }
        return this.tiles[y][x];
    }
    
    collectItem(x, y) {
        const item = this.items.find(item => 
            item.x === x && item.y === y && !item.collected
        );
        
        if (item) {
            item.collected = true;
            return item;
        }
        return null;
    }
    
    render(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.min(this.width, startX + Math.ceil(camera.width / this.tileSize) + 1);
        const endY = Math.min(this.height, startY + Math.ceil(camera.height / this.tileSize) + 1);
        
        // Renderizar tiles del terreno
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tileType = this.getTile(x, y);
                if (tileType > 0) {
                    const pixelX = x * this.tileSize;
                    const pixelY = y * this.tileSize;
                    this.renderTile(ctx, tileType, pixelX, pixelY, x, y);
                }
            }
        }
        
        // Renderizar decoraciones
        this.decorations.forEach(decoration => {
            const pixelX = decoration.x * this.tileSize;
            const pixelY = decoration.y * this.tileSize;
            
            if (camera.isVisible(pixelX, pixelY, this.tileSize, this.tileSize)) {
                this.renderDecoration(ctx, decoration, pixelX, pixelY);
            }
        });
        
        // Renderizar items
        this.items.forEach(item => {
            if (!item.collected) {
                const pixelX = item.x * this.tileSize;
                const pixelY = item.y * this.tileSize;
                
                if (camera.isVisible(pixelX, pixelY, this.tileSize, this.tileSize)) {
                    this.renderItem(ctx, item, pixelX, pixelY);
                }
            }
        });
    }
    
    renderTile(ctx, tileType, x, y, tileX, tileY) {
        let sprite = null;
        
        switch (tileType) {
            case 1: // Superficie de tierra
                sprite = this.assetManager.getSprite('floor');
                break;
            case 2: // Tierra sólida
                sprite = this.assetManager.getSprite('wall');
                break;
            case 3: // Plataforma
                sprite = this.assetManager.getSprite('floor_alt');
                if (!sprite) sprite = this.assetManager.getSprite('floor');
                break;
        }
        
        if (sprite) {
            ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
        } else {
            // Fallback con colores tierra
            switch (tileType) {
                case 1: // Superficie
                    ctx.fillStyle = '#D2691E'; // Chocolate
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    // Añadir textura de hierba
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(x, y, this.tileSize, 2);
                    break;
                case 2: // Tierra sólida
                    ctx.fillStyle = '#8B4513'; // Marrón silla
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    // Añadir puntos para textura
                    ctx.fillStyle = '#A0522D';
                    if ((tileX + tileY) % 3 === 0) {
                        ctx.fillRect(x + 2, y + 2, 2, 2);
                        ctx.fillRect(x + 8, y + 8, 2, 2);
                    }
                    break;
                case 3: // Plataforma
                    ctx.fillStyle = '#CD853F'; // Marrón arena
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#DEB887';
                    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
                    break;
            }
        }
    }
    
    renderDecoration(ctx, decoration, x, y) {
        const sprite = this.assetManager.getSprite(decoration.type);
        
        if (sprite) {
            if (decoration.type === 'torch') {
                ctx.save();
                ctx.shadowColor = '#FF6347';
                ctx.shadowBlur = 6;
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
            }
        } else {
            // Fallback para decoraciones
            switch (decoration.type) {
                case 'flower1':
                    ctx.fillStyle = '#FF69B4';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    ctx.fillStyle = '#32CD32';
                    ctx.fillRect(x + 7, y + 10, 2, 6);
                    break;
                case 'flower2':
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    ctx.fillStyle = '#32CD32';
                    ctx.fillRect(x + 7, y + 10, 2, 6);
                    break;
                case 'torch':
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 7, y + 8, 2, 8);
                    ctx.fillStyle = '#FF6347';
                    ctx.fillRect(x + 6, y + 4, 4, 4);
                    break;
            }
        }
    }
    
    renderItem(ctx, item, x, y) {
        const sprite = this.assetManager.getSprite(item.type);
        
        // Efecto de flotación para items
        const floatOffset = Math.sin(Date.now() * 0.003 + x + y) * 2;
        const renderY = y + floatOffset;
        
        if (sprite) {
            // Efectos especiales para diferentes tipos de items
            if (item.type.includes('gem')) {
                ctx.save();
                ctx.shadowColor = item.type === 'gem_blue' ? '#4169E1' : 
                                 item.type === 'gem_red' ? '#DC143C' : '#32CD32';
                ctx.shadowBlur = 4;
                ctx.drawImage(sprite, x, renderY, this.tileSize, this.tileSize);
                ctx.restore();
            } else if (item.type === 'coin') {
                ctx.save();
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 3;
                ctx.drawImage(sprite, x, renderY, this.tileSize, this.tileSize);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, x, renderY, this.tileSize, this.tileSize);
            }
        } else {
            // Fallback para items
            switch (item.type) {
                case 'coin':
                    ctx.save();
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 3;
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 4, renderY + 4, 8, 8);
                    ctx.fillStyle = '#FFA500';
                    ctx.fillRect(x + 6, renderY + 6, 4, 4);
                    ctx.restore();
                    break;
                case 'gem_blue':
                    ctx.save();
                    ctx.shadowColor = '#4169E1';
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = '#4169E1';
                    ctx.fillRect(x + 4, renderY + 4, 8, 8);
                    ctx.restore();
                    break;
                case 'gem_red':
                    ctx.save();
                    ctx.shadowColor = '#DC143C';
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = '#DC143C';
                    ctx.fillRect(x + 4, renderY + 4, 8, 8);
                    ctx.restore();
                    break;
                case 'gem_green':
                    ctx.save();
                    ctx.shadowColor = '#32CD32';
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = '#32CD32';
                    ctx.fillRect(x + 4, renderY + 4, 8, 8);
                    ctx.restore();
                    break;
                case 'potion_red':
                    ctx.fillStyle = '#DC143C';
                    ctx.fillRect(x + 6, renderY + 4, 4, 8);
                    ctx.fillStyle = '#FF69B4';
                    ctx.fillRect(x + 6, renderY + 4, 4, 2);
                    break;
                case 'potion_blue':
                    ctx.fillStyle = '#4169E1';
                    ctx.fillRect(x + 6, renderY + 4, 4, 8);
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(x + 6, renderY + 4, 4, 2);
                    break;
            }
        }
    }
}