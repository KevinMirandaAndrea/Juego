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
    }
    
    createRooms() {
        const rooms = [];
        const numRooms = 8 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numRooms; i++) {
            const roomWidth = 4 + Math.floor(Math.random() * 6);
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
                
                // Crear el suelo de la habitación
                for (let ry = y; ry < y + roomHeight; ry++) {
                    for (let rx = x; rx < x + roomWidth; rx++) {
                        this.tiles[ry][rx] = 0; // Suelo
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
            if (Math.random() < 0.4) { // 40% de probabilidad de cofre por habitación
                const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
                
                this.items.push({
                    type: 'chest',
                    x: x,
                    y: y,
                    opened: false
                });
            }
        });
        
        // Añadir algunas pociones aleatorias
        for (let i = 0; i < 5; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
            } while (this.isWall(x, y) || this.hasItemAt(x, y));
            
            this.items.push({
                type: Math.random() < 0.5 ? 'potion_red' : 'potion_blue',
                x: x,
                y: y
            });
        }
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
                
                this.renderTile(ctx, tileType, pixelX, pixelY);
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
    
    renderTile(ctx, tileType, x, y) {
        let sprite = null;
        
        switch (tileType) {
            case 0: // Suelo
                sprite = this.assetManager.getSprite('floor');
                if (!sprite) {
                    sprite = this.assetManager.getSprite('floor_alt');
                }
                break;
            case 1: // Pared
                sprite = this.assetManager.getSprite('wall');
                break;
        }
        
        if (sprite) {
            ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
        } else {
            // Fallback con mejor diseño
            switch (tileType) {
                case 0: // Suelo
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#34495e';
                    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                    break;
                case 1: // Pared
                    ctx.fillStyle = '#1a252f';
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
                    break;
            }
        }
    }
    
    renderItem(ctx, item, x, y) {
        const spriteName = item.type === 'chest' && item.opened ? 'chest_open' : item.type;
        const sprite = this.assetManager.getSprite(spriteName);
        
        if (sprite) {
            ctx.drawImage(sprite, x, y, this.tileSize, this.tileSize);
        } else {
            // Fallback para items
            switch (item.type) {
                case 'chest':
                    ctx.fillStyle = item.opened ? '#8B4513' : '#654321';
                    ctx.fillRect(x + 2, y + 4, 12, 8);
                    break;
                case 'potion_red':
                    ctx.fillStyle = '#ff4757';
                    ctx.fillRect(x + 6, y + 4, 4, 8);
                    break;
                case 'potion_blue':
                    ctx.fillStyle = '#3742fa';
                    ctx.fillRect(x + 6, y + 4, 4, 8);
                    break;
            }
        }
    }
}