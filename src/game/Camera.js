export class Camera {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.target = null;
        this.smoothing = 0.1;
    }
    
    follow(target) {
        this.target = target;
    }
    
    update() {
        if (this.target) {
            const targetX = this.target.x - this.width / 2;
            const targetY = this.target.y - this.height / 2;
            
            // Suavizar el movimiento de la cámara
            this.x += (targetX - this.x) * this.smoothing;
            this.y += (targetY - this.y) * this.smoothing;
        }
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    isVisible(x, y, width, height) {
        return x < this.x + this.width &&
               x + width > this.x &&
               y < this.y + this.height &&
               y + height > this.y;
    }
}