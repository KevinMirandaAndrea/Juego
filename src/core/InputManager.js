export class InputManager {
    constructor() {
        this.keys = new Set();
        this.previousKeys = new Set();
        this.mousePos = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // Mouse events
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button);
        });
        
        window.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button);
        });
        
        // Clear inputs when window loses focus
        window.addEventListener('blur', () => {
            this.keys.clear();
            this.mouseButtons.clear();
        });
    }
    
    update() {
        this.previousKeys = new Set(this.keys);
    }
    
    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }
    
    isKeyJustPressed(keyCode) {
        return this.keys.has(keyCode) && !this.previousKeys.has(keyCode);
    }
    
    isKeyJustReleased(keyCode) {
        return !this.keys.has(keyCode) && this.previousKeys.has(keyCode);
    }
    
    isMouseButtonPressed(button) {
        return this.mouseButtons.has(button);
    }
    
    getMousePosition() {
        return { ...this.mousePos };
    }
    
    // Movement helpers
    getHorizontalInput() {
        let horizontal = 0;
        if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) horizontal -= 1;
        if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) horizontal += 1;
        return horizontal;
    }
    
    getJumpInput() {
        return this.isKeyJustPressed('Space') || this.isKeyJustPressed('KeyW') || this.isKeyJustPressed('ArrowUp');
    }
    
    getDashInput() {
        return this.isKeyJustPressed('ShiftLeft') || this.isKeyJustPressed('ShiftRight');
    }
    
    getWallJumpInput() {
        return this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp');
    }
}