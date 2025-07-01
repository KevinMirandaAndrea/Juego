export class AssetManager {
    constructor() {
        this.sprites = new Map();
        this.sounds = new Map();
        this.loaded = false;
    }
    
    async loadAssets() {
        try {
            await this.loadLocalTiles();
            this.loaded = true;
            console.log('Assets cargados correctamente');
        } catch (error) {
            console.error('Error cargando assets:', error);
            this.loaded = true; // Continuar con fallbacks
        }
    }
    
    async loadLocalTiles() {
        // Lista de sprites usando los tiles locales disponibles
        const spriteList = [
            // Personajes
            { name: 'player', path: '/tile_0084.png' },
            { name: 'player_walk1', path: '/tile_0085.png' },
            { name: 'enemy_orc', path: '/tile_0086.png' },
            { name: 'enemy_skeleton', path: '/tile_0087.png' },
            { name: 'enemy_goblin', path: '/tile_0088.png' },
            
            // Tiles de mazmorra
            { name: 'wall', path: '/tile_0001.png' },
            { name: 'wall_corner', path: '/tile_0002.png' },
            { name: 'wall_top', path: '/tile_0003.png' },
            { name: 'wall_side', path: '/tile_0004.png' },
            { name: 'floor', path: '/tile_0017.png' },
            { name: 'floor_alt', path: '/tile_0018.png' },
            
            // Puertas
            { name: 'door_closed', path: '/tile_0019.png' },
            { name: 'door_open', path: '/tile_0020.png' },
            
            // Items y objetos
            { name: 'chest_closed', path: '/tile_0040.png' },
            { name: 'chest_open', path: '/tile_0041.png' },
            { name: 'key', path: '/tile_0042.png' },
            { name: 'coin', path: '/tile_0043.png' },
            { name: 'potion_red', path: '/tile_0044.png' },
            { name: 'potion_blue', path: '/tile_0045.png' },
            
            // Armas
            { name: 'sword', path: '/tile_0046.png' },
            { name: 'bow', path: '/tile_0047.png' },
            
            // Decoraciones
            { name: 'torch', path: '/tile_0048.png' },
            { name: 'skull', path: '/tile_0049.png' },
            
            // Más enemigos y personajes
            { name: 'enemy_bat', path: '/tile_0089.png' },
            { name: 'enemy_spider', path: '/tile_0090.png' },
            { name: 'enemy_slime', path: '/tile_0091.png' },
            
            // Más tiles de decoración
            { name: 'stairs_down', path: '/tile_0050.png' },
            { name: 'stairs_up', path: '/tile_0051.png' },
            { name: 'pillar', path: '/tile_0052.png' },
            { name: 'altar', path: '/tile_0053.png' },
            
            // Más items
            { name: 'gem_blue', path: '/tile_0054.png' },
            { name: 'gem_red', path: '/tile_0055.png' },
            { name: 'gem_green', path: '/tile_0056.png' },
            { name: 'book', path: '/tile_0057.png' },
            { name: 'scroll', path: '/tile_0058.png' }
        ];
        
        const loadPromises = spriteList.map(sprite => this.loadSprite(sprite.name, sprite.path));
        const results = await Promise.allSettled(loadPromises);
        
        // Verificar cuántos sprites se cargaron exitosamente
        const successful = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Sprites cargados: ${successful}/${spriteList.length}`);
        
        // Mostrar qué sprites se cargaron
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`✓ ${spriteList[index].name}`);
            } else {
                console.warn(`✗ ${spriteList[index].name}: ${spriteList[index].path}`);
            }
        });
    }
    
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
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
        const enemySprites = ['enemy_orc', 'enemy_skeleton', 'enemy_goblin', 'enemy_bat', 'enemy_spider', 'enemy_slime'];
        const randomSprite = enemySprites[Math.floor(Math.random() * enemySprites.length)];
        return this.getSprite(randomSprite) || null;
    }
    
    // Método para obtener sprites de gemas aleatorias
    getRandomGemSprite() {
        const gemSprites = ['gem_blue', 'gem_red', 'gem_green'];
        const randomSprite = gemSprites[Math.floor(Math.random() * gemSprites.length)];
        return this.getSprite(randomSprite) || null;
    }
}