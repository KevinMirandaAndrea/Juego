export class AssetManager {
    constructor() {
        this.sprites = new Map();
        this.spritesheets = new Map();
        this.sounds = new Map();
        this.loaded = false;
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    async loadAssets() {
        try {
            this.updateLoadingText('Loading sprites...');
            await this.loadSprites();
            
            this.updateLoadingText('Generating sprite sheets...');
            await this.generateSpritesheets();
            
            this.updateLoadingText('Initializing audio...');
            await this.loadAudio();
            
            this.updateLoadingText('Ready!');
            this.loaded = true;
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                document.getElementById('ui').style.display = 'block';
            }, 500);
            
        } catch (error) {
            console.error('Error loading assets:', error);
            this.loaded = true;
        }
    }
    
    updateLoadingText(text) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }
    
    updateLoadingProgress(progress) {
        this.loadingProgress = progress;
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    async loadSprites() {
        const spriteList = [
            // Characters
            { name: 'player_idle', path: '/tile_0084.png' },
            { name: 'player_walk1', path: '/tile_0085.png' },
            { name: 'player_walk2', path: '/tile_0084.png' },
            { name: 'player_jump', path: '/tile_0085.png' },
            { name: 'player_fall', path: '/tile_0084.png' },
            
            // Enemies
            { name: 'enemy_orc', path: '/tile_0086.png' },
            { name: 'enemy_skeleton', path: '/tile_0087.png' },
            { name: 'enemy_goblin', path: '/tile_0088.png' },
            { name: 'enemy_bat', path: '/tile_0089.png' },
            { name: 'enemy_spider', path: '/tile_0090.png' },
            { name: 'enemy_slime', path: '/tile_0091.png' },
            
            // Environment - Forest Biome
            { name: 'forest_ground', path: '/tile_0017.png' },
            { name: 'forest_grass', path: '/tile_0018.png' },
            { name: 'forest_tree_trunk', path: '/tile_0001.png' },
            { name: 'forest_leaves', path: '/tile_0002.png' },
            { name: 'forest_platform', path: '/tile_0003.png' },
            
            // Environment - Cave Biome
            { name: 'cave_wall', path: '/tile_0004.png' },
            { name: 'cave_floor', path: '/tile_0005.png' },
            { name: 'cave_stalactite', path: '/tile_0006.png' },
            { name: 'cave_crystal', path: '/tile_0054.png' },
            
            // Environment - Mountain Biome
            { name: 'mountain_rock', path: '/tile_0007.png' },
            { name: 'mountain_snow', path: '/tile_0008.png' },
            { name: 'mountain_ice', path: '/tile_0009.png' },
            
            // Items and Collectibles
            { name: 'coin', path: '/tile_0043.png' },
            { name: 'gem_blue', path: '/tile_0054.png' },
            { name: 'gem_red', path: '/tile_0055.png' },
            { name: 'gem_green', path: '/tile_0056.png' },
            { name: 'potion_health', path: '/tile_0044.png' },
            { name: 'potion_energy', path: '/tile_0045.png' },
            { name: 'key', path: '/tile_0042.png' },
            
            // Power-ups
            { name: 'powerup_speed', path: '/tile_0046.png' },
            { name: 'powerup_jump', path: '/tile_0047.png' },
            { name: 'powerup_dash', path: '/tile_0048.png' },
            
            // Interactive Objects
            { name: 'chest_closed', path: '/tile_0040.png' },
            { name: 'chest_open', path: '/tile_0041.png' },
            { name: 'door_closed', path: '/tile_0019.png' },
            { name: 'door_open', path: '/tile_0020.png' },
            { name: 'lever_off', path: '/tile_0021.png' },
            { name: 'lever_on', path: '/tile_0022.png' },
            
            // Decorations
            { name: 'torch', path: '/tile_0048.png' },
            { name: 'flower1', path: '/tile_0049.png' },
            { name: 'flower2', path: '/tile_0050.png' },
            { name: 'mushroom', path: '/tile_0051.png' },
            { name: 'vine', path: '/tile_0052.png' },
            
            // Particles and Effects
            { name: 'particle_spark', path: '/tile_0057.png' },
            { name: 'particle_leaf', path: '/tile_0058.png' },
            { name: 'particle_dust', path: '/tile_0059.png' }
        ];
        
        this.totalAssets = spriteList.length;
        this.loadedAssets = 0;
        
        const loadPromises = spriteList.map(async (sprite, index) => {
            try {
                await this.loadSprite(sprite.name, sprite.path);
                this.loadedAssets++;
                this.updateLoadingProgress((this.loadedAssets / this.totalAssets) * 70);
            } catch (error) {
                console.warn(`Failed to load sprite: ${sprite.name}`);
                this.loadedAssets++;
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    async generateSpritesheets() {
        // Generate animation spritesheets
        this.createAnimationSheet('player_walk', ['player_idle', 'player_walk1', 'player_walk2', 'player_walk1']);
        this.createAnimationSheet('player_run', ['player_walk1', 'player_walk2']);
        
        // Enemy animations
        this.createAnimationSheet('enemy_orc_walk', ['enemy_orc']);
        this.createAnimationSheet('enemy_skeleton_walk', ['enemy_skeleton']);
        
        this.updateLoadingProgress(85);
    }
    
    createAnimationSheet(name, spriteNames) {
        const frames = spriteNames.map(spriteName => this.getSprite(spriteName)).filter(Boolean);
        if (frames.length > 0) {
            this.spritesheets.set(name, {
                frames: frames,
                frameCount: frames.length,
                currentFrame: 0,
                frameTime: 0,
                frameDuration: 150
            });
        }
    }
    
    async loadAudio() {
        // Audio will be implemented with Web Audio API
        // For now, we'll create placeholder audio objects
        this.sounds.set('jump', { play: () => {} });
        this.sounds.set('collect', { play: () => {} });
        this.sounds.set('damage', { play: () => {} });
        this.sounds.set('powerup', { play: () => {} });
        
        this.updateLoadingProgress(100);
    }
    
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load ${path}`));
            img.src = path;
        });
    }
    
    getSprite(name) {
        return this.sprites.get(name);
    }
    
    getAnimationFrame(animationName, deltaTime) {
        const animation = this.spritesheets.get(animationName);
        if (!animation) return null;
        
        animation.frameTime += deltaTime;
        if (animation.frameTime >= animation.frameDuration) {
            animation.currentFrame = (animation.currentFrame + 1) % animation.frameCount;
            animation.frameTime = 0;
        }
        
        return animation.frames[animation.currentFrame];
    }
    
    playSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.play();
        }
    }
    
    isLoaded() {
        return this.loaded;
    }
}