export class AssetManager {
    constructor() {
        this.sprites = new Map();
        this.sounds = new Map();
        this.loaded = false;
    }
    
    async loadAssets() {
        try {
            await this.loadKenneyAssets();
            this.loaded = true;
            console.log('Assets cargados correctamente');
        } catch (error) {
            console.error('Error cargando assets:', error);
            this.loaded = true; // Continuar con fallbacks
        }
    }
    
    async loadKenneyAssets() {
        // Lista de sprites específicos de Kenney Tiny Dungeon
        const spriteList = [
            // Personajes
            { name: 'player', path: '/kenney_tiny-dungeon/Tiles/tile_0084.png' },
            { name: 'player_walk1', path: '/kenney_tiny-dungeon/Tiles/tile_0085.png' },
            { name: 'enemy_orc', path: '/kenney_tiny-dungeon/Tiles/tile_0086.png' },
            { name: 'enemy_skeleton', path: '/kenney_tiny-dungeon/Tiles/tile_0087.png' },
            { name: 'enemy_goblin', path: '/kenney_tiny-dungeon/Tiles/tile_0088.png' },
            
            // Tiles de mazmorra
            { name: 'wall', path: '/kenney_tiny-dungeon/Tiles/tile_0001.png' },
            { name: 'wall_corner', path: '/kenney_tiny-dungeon/Tiles/tile_0002.png' },
            { name: 'floor', path: '/kenney_tiny-dungeon/Tiles/tile_0017.png' },
            { name: 'floor_alt', path: '/kenney_tiny-dungeon/Tiles/tile_0018.png' },
            
            // Puertas
            { name: 'door_closed', path: '/kenney_tiny-dungeon/Tiles/tile_0019.png' },
            { name: 'door_open', path: '/kenney_tiny-dungeon/Tiles/tile_0020.png' },
            
            // Items y objetos
            { name: 'chest_closed', path: '/kenney_tiny-dungeon/Tiles/tile_0040.png' },
            { name: 'chest_open', path: '/kenney_tiny-dungeon/Tiles/tile_0041.png' },
            { name: 'key', path: '/kenney_tiny-dungeon/Tiles/tile_0042.png' },
            { name: 'coin', path: '/kenney_tiny-dungeon/Tiles/tile_0043.png' },
            { name: 'potion_red', path: '/kenney_tiny-dungeon/Tiles/tile_0044.png' },
            { name: 'potion_blue', path: '/kenney_tiny-dungeon/Tiles/tile_0045.png' },
            
            // Armas
            { name: 'sword', path: '/kenney_tiny-dungeon/Tiles/tile_0046.png' },
            { name: 'bow', path: '/kenney_tiny-dungeon/Tiles/tile_0047.png' },
            
            // Decoraciones
            { name: 'torch', path: '/kenney_tiny-dungeon/Tiles/tile_0048.png' },
            { name: 'skull', path: '/kenney_tiny-dungeon/Tiles/tile_0049.png' }
        ];
        
        const loadPromises = spriteList.map(sprite => this.loadSprite(sprite.name, sprite.path));
        const results = await Promise.allSettled(loadPromises);
        
        // Verificar cuántos sprites se cargaron exitosamente
        const successful = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Sprites cargados: ${successful}/${spriteList.length}`);
    }
    
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                console.log(`✓ Sprite cargado: ${name}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`✗ No se pudo cargar: ${path}`);
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
    
    // Método para obtener un sprite aleatorio de enemigo
    getRandomEnemySprite() {
        const enemySprites = ['enemy_orc', 'enemy_skeleton', 'enemy_goblin'];
        const randomSprite = enemySprites[Math.floor(Math.random() * enemySprites.length)];
        return this.getSprite(randomSprite) || null;
    }
}