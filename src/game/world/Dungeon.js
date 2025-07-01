export class Dungeon {
    constructor(width, height, assetManager) {
        this.width = width;
        this.height = height;
        this.assetManager = assetManager;
        this.tileSize = 16;
        this.tiles = [];
        
        this.generateDungeon();
    }
    
    generateDungeon() {
        // Inicializar con paredes
        this.tiles = Array(this.height).fill().map(() => Array(this.width).fill(1));
        
        // Crear habitaciones y pasillos usando un algoritmo simple
        this.createRooms();
        this.connectRooms();
        this.addDetails();
    }
    
    createRooms() {
        const rooms = [];
        const numRooms = 8 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numRooms; i++) {
            const roomWidth = 4 + Math.floor(Math.random() * 6);
            const roomHeight = 4 + Math.floor(Math.random() * 6);
            const x = 1 + Math.floor(Math.random() * (this.width - roomWidth - 2));
            const y = 1 + Math.floor(Math.random() * (this.height - roomHeight - 2));
            
            // Verificar que no se superponga con otras habitaciones
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
        // Conectar habitaciones con pasillos
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
            
            // Crear pasillo en L
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
    
    addDetails() {
        // Añadir algunos elementos decorativos
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.05) {
                    this.tiles[y][x] = 2; // Elemento decorativo
                }
            }
        }
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }
        return this.tiles[y][x] === 1;
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 1; // Pared por defecto
        }
        return this.tiles[y][x];
    }
    
    render(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.min(this.width, startX + Math.ceil(camera.width / this.tileSize) + 1);
        const endY = Math.min(this.height, startY + Math.ceil(camera.height / this.tileSize) + 1);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tileType = this.getTile(x, y);
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;
                
                this.renderTile(ctx, tileType, pixelX, pixelY);
            }
        }
    }
    
    renderTile(ctx, tileType, x, y) {
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
            case 2: // Decoración
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                ctx.fillStyle = '#f39c12';
                ctx.fillRect(x + 4, y + 4, 8, 8);
                break;
        }
    }
}