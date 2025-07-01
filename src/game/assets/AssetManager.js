export class AssetManager {
    constructor() {
        this.sprites = new Map();
        this.sounds = new Map();
        this.loaded = false;
    }
    
    async loadAssets() {
        try {
            // Intentar cargar sprites de Kenney
            await this.loadKenneyAssets();
        } catch (error) {
            console.log('No se pudieron cargar los assets de Kenney, usando fallbacks');
        }
        
        this.loaded = true;
    }
    
    async loadKenneyAssets() {
        // Lista de sprites que intentaremos cargar
        const spriteList = [
            { name: 'player', path: 'kenney_tiny-dungeon/Tiles/tile_0084.png' },
            { name: 'enemy', path: 'kenney_tiny-dungeon/Tiles/tile_0085.png' },
            { name: 'wall', path: 'kenney_tiny-dungeon/Tiles/tile_0001.png' },
            { name: 'floor', path: 'kenney_tiny-dungeon/Tiles/tile_0002.png' },
            { name: 'door', path: 'kenney_tiny-dungeon/Tiles/tile_0020.png' },
            { name: 'chest', path: 'kenney_tiny-dungeon/Tiles/tile_0040.png' }
        ];
        
        const loadPromises = spriteList.map(sprite => this.loadSprite(sprite.name, sprite.path));
        await Promise.allSettled(loadPromises);
    }
    
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                console.log(`Sprite cargado: ${name}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`No se pudo cargar el sprite: ${path}`);
                reject(new Error(`Failed to load ${path}`));
            };
            img.src = path;
        });
    }
    
    getSprite(name) {
        return this.sprites.get(name);
    }
    
    hasSprite(name) {
        return this.sprites.has(name);
    }
    
    isLoaded() {
        return this.loaded;
    }
}