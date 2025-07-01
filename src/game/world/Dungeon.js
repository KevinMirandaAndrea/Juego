export class Dungeon {
    constructor(width, height, assetManager) {
        this.width = width;
        this.height = height;
        this.assetManager = assetManager;
        this.tileSize = 16;
        this.tiles = [];
        this.items = []; // Para cofres, pociones, etc.
        
        this.generateDungeon();
    }
    
    generateDungeon() {
        // Inicializar con paredes
        this.tiles = Array(this.height).fill().map(() => Array(this.width).fill(1));
        
        this.createRooms();
        this.connectRooms();
        this.addItems();
        this.addDecorations();
        this.addStructuralElements();
    }
    
    createRooms() {
        const rooms = [];
        const numRooms = 8 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numRooms; i++) {
            const roomWidth = 4 + Math.floor(Math.random() * 8);
            const roomHeight = 4 + Math.floor(Math.random() * 6);
            const x = 1 + Math.floor(Math.random() * (this.width - roomWidth - 2));
            const y = 1 + Math.floor(Math.random() * (this.height - roomHeight - 2));
            
            let overlaps = false;
            for (const room of rooms) {
                if (x < room.x + room.width + 1 && x + roomWidth + 1 > room.x &&
                    y < room.y + room.height + 1 && y + roomHeight + 1 > room.y) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                rooms.push({ x, y, width: roomWidth, height: roomHeight });
                
                // Crear el suelo de la habitación con variación
                for (let ry = y; ry < y + roomHeight; ry++) {
                    for (let rx = x; rx < x + roomWidth; rx++) {
                        // Alternar entre tipos de suelo para más variedad
                        this.tiles[ry][rx] = Math.random() < 0.7 ? 0 : 2; // 0 = suelo normal, 2 = suelo alternativo
                    }
                }
            }
        }
        
        this.rooms = rooms;
    }
    
    connectRooms() {
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            
            const centerA = {
                x: Math.floor(roomA.x + roomA.width / 2),
                y: Math.floor(roomA.y + roomA.height / 2)
            };
            const centerB = {
                x: Math.floor(roomB.x + roomB.width / 2),
                y: Math.floor(roomB.y + roomB.height / 2)
            };
            
            this.createCorridor(centerA.x, centerA.y, centerB.x, centerA.y);
            this.createCorridor(centerB.x, centerA.y, centerB.x, centerB.y);
        }
    }
    
    createCorridor(x1, y1, x2, y2) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let x = startX; x <= endX; x++) {
            if (x >= 0 && x < this.width && y1 >= 0 && y1 < this.height) {
                this.tiles[y1][x] = 0;
            }
        }
        
        for (let y = startY; y <= endY; y++) {
            if (x2 >= 0 && x2 < this.width && y >= 0 && y < this.height) {
                this.tiles[y][x2] = 0;
            }
        }
    }
    
    addItems() {
        this.items = [];
        
        // Añadir cofres en algunas habitaciones
        this.rooms.forEach((room, index) => {
            if (Math.random() < 0.5) { // 50% de probabilidad de cofre por habitación
                const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
                
                this.items.push({
                    type: 'chest_closed',
                    x: x,
                    y: y,
                    opened: false
                });
            }
        });
        
        // Añadir pociones, gemas y otros items
        for (let i = 0; i < 12; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
            } while (this.isWall(x, y) || this.hasItemAt(x, y));
            
            const itemTypes = [
                'potion_red', 'potion_blue', 'gem_blue', 'gem_red', 'gem_green', 
                'coin', 'key', 'book', 'scroll', 'sword', 'bow'
            ];
            const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            
            this.items.push({
                type: randomType,
                x: x,
                y: y
            });
        }
    }
    
    addDecorations() {
        // Añadir decoraciones como antorchas, calaveras, etc.
        this.rooms.forEach(room => {
            // Antorchas en las esquinas de algunas habitaciones
            if (Math.random() < 0.4) {
                this.items.push({
                    type: 'torch',
                    x: room.x,
                    y: room.y,
                    decoration: true
                });
            }
            
            // Pilares en habitaciones grandes
            if (room.width > 6 && room.height > 5 && Math.random() < 0.3) {
                const pillarX = room.x + Math.floor(room.width / 2);
                const pillarY = room.y + Math.floor(room.height / 2);
                
                this.items.push({
                    type: 'pillar',
                    x: pillarX,
                    y: pillarY,
                    decoration: true
                });
            }
            
            // Calaveras ocasionales
            if (Math.random() < 0.2) {
                const x = room.x + Math.floor(Math.random() * room.width);
                const y = room.y + Math.floor(Math.random() * room.height);
                
                if (!this.hasItemAt(x, y)) {
                    this.items.push({
                        type: 'skull',
                        x: x,
                        y: y,
                        decoration: true
                    });
                }
            }
        });
    }
    
    addStructuralElements() {
        // Añadir escaleras en algunas habitaciones
        if (this.rooms.length > 0) {
            const randomRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
            this.items.push({
                type: 'stairs_down',
                x: randomRoom.x + Math.floor(randomRoom.width / 2),
                y: randomRoom.y + Math.floor(randomRoom.height / 2),
                decoration: true
            });
        }
        
        // Añadir altares en habitaciones especiales
        this.rooms.forEach(room => {
            if (room.width >= 6 && room.height >= 6 && Math.random() < 0.15) {
                this.items.push({
                    type: 'altar',
                    x: room.x + Math.floor(room.width / 2),
                    y: room.y + Math.floor(room.height / 2),
                    decoration: true
                });
            }
        });
    }
    
    hasItemAt(x, y) {
        return this.items.some(item => item.x === x && item.y === y);
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }
        return this.tiles[y][x] === 1;
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 1;
        }
        return this.tiles[y][x];
    }
    
    render(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.min(this.width, startX + Math.ceil(camera.width / this.tileSize) + 1);
        const endY = Math.min(this.height, startY + Math.ceil(camera.height / this.tileSize) + 1);
        
        // Renderizar tiles
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tileType = this.getTile(x, y);
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                
                this.renderTile(ctx, tileType, pixelX, pixelY, x, y);
            }
        }
        
        // Renderizar items
        this.items.forEach(item => {
            const pixelX = item.x * this.tileSize;
            const pixelY = item.y * this.tileSize;
            
            if (camera.isVisible(pixelX, pixelY, this.tileSize, this.tileSize)) {
                this.renderItem(ctx, item, pixelX, pixelY);
            }
        });
    }
    
    renderTile(ctx, tileType, x, y, tileX, tileY) {
        let sprite = null;
        
        switch (tileType) {
            case 0: // Suelo
                sprite = this.assetManager.getSprite('floor');
                break;
            case 1: // Pared
                sprite = this.assetManager.getSprite('wall');
                break;
            case 2: // Suelo alternativo
                sprite = this.assetManager.getSprite('floor_alt');
                if (!sprite) sprite = this.assetManager.getSprite('floor');
                break;
        }
        
        if (sprite) {
            ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
        } else {
            // Fallback con colores más cálidos inspirados en la imagen
            switch (tileType) {
                case 0: // Suelo
                    ctx.fillStyle = '#8B4513'; // Marrón tierra
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#A0522D'; // Marrón más claro
                    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
                    break;
                case 1: // Pared
                    ctx.fillStyle = '#654321'; // Marrón oscuro
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#8B4513'; // Marrón medio
                    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
                    break;
                case 2: // Suelo alternativo
                    ctx.fillStyle = '#CD853F'; // Marrón arena
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#DEB887'; // Beige
                    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                    break;
            }
        }
    }
    
    renderItem(ctx, item, x, y) {
        const spriteName = item.type === 'chest_closed' && item.opened ? 'chest_open' : item.type;
        const sprite = this.assetManager.getSprite(spriteName);
        
        if (sprite) {
            // Efectos especiales para diferentes tipos de items
            if (item.type.includes('gem')) {
                ctx.save();
                ctx.shadowColor = item.type === 'gem_blue' ? '#4169E1' : 
                                 item.type === 'gem_red' ? '#DC143C' : '#32CD32';
                ctx.shadowBlur = 4;
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
                ctx.restore();
            } else if (item.type === 'torch') {
                ctx.save();
                ctx.shadowColor = '#FF6347';
                ctx.shadowBlur = 6;
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
                ctx.restore();
            } else if (item.type === 'coin') {
                ctx.save();
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 2;
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
            }
        } else {
            // Fallback para items con colores más vibrantes
            switch (item.type) {
                case 'chest_closed':
                    ctx.fillStyle = item.opened ? '#8B4513' : '#654321';
                    ctx.fillRect(x + 2, y + 4, 12, 8);
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 6, y + 6, 4, 2);
                    break;
                case 'potion_red':
                    ctx.fillStyle = '#DC143C';
                    ctx.fillRect(x + 6, y + 4, 4, 8);
                    ctx.fillStyle = '#FF69B4';
                    ctx.fillRect(x + 6, y + 4, 4, 2);
                    break;
                case 'potion_blue':
                    ctx.fillStyle = '#4169E1';
                    ctx.fillRect(x + 6, y + 4, 4, 8);
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(x + 6, y + 4, 4, 2);
                    break;
                case 'coin':
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    ctx.fillStyle = '#FFA500';
                    ctx.fillRect(x + 7, y + 7, 2, 2);
                    break;
                case 'key':
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 6, y + 4, 4, 8);
                    ctx.fillRect(x + 10, y + 6, 2, 2);
                    break;
                case 'gem_blue':
                    ctx.fillStyle = '#4169E1';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    break;
                case 'gem_red':
                    ctx.fillStyle = '#DC143C';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    break;
                case 'gem_green':
                    ctx.fillStyle = '#32CD32';
                    ctx.fillRect(x + 6, y + 6, 4, 4);
                    break;
                case 'torch':
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 7, y + 8, 2, 6);
                    ctx.fillStyle = '#FF6347';
                    ctx.fillRect(x + 6, y + 4, 4, 4);
                    break;
            }
        }
    }
}