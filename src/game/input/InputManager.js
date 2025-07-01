export class InputManager {
    constructor() {
        this.keys = new Set();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            // Prevenir scroll con las flechas
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // Limpiar teclas cuando la ventana pierde el foco
        window.addEventListener('blur', () => {
            this.keys.clear();
        });
    }
    
    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }
    
    isAnyKeyPressed(...keyCodes) {
        return keyCodes.some(code => this.keys.has(code));
    }
}