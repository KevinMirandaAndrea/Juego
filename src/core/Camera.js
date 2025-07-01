export class Camera {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.target = null;
        this.smoothing = 0.08;
        this.deadZone = { x: 100, y: 50 };
        this.bounds = null;
        this.shake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.zoom = 1;
        this.targetZoom = 1;
    }
    
    follow(target) {
        this.target = target;
    }
    
    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
    }
    
    update(deltaTime) {
        if (this.target) {
            this.updatePosition();
        }
        
        this.updateShake(deltaTime);
        this.updateZoom(deltaTime);
        this.constrainToBounds();
    }
    
    updatePosition() {
        const targetX = this.target.x + this.target.width / 2 - this.width / 2;
        const targetY = this.target.y + this.target.height / 2 - this.height / 2;
        
        // Dead zone logic
        const deltaX = targetX - this.x;
        const deltaY = targetY - this.y;
        
        if (Math.abs(deltaX) > this.deadZone.x) {
            this.x += (deltaX - Math.sign(deltaX) * this.deadZone.x) * this.smoothing;
        }
        
        if (Math.abs(deltaY) > this.deadZone.y) {
            this.y += (deltaY - Math.sign(deltaY) * this.deadZone.y) * this.smoothing;
        }
    }
    
    updateShake(deltaTime) {
        if (this.shake.duration > 0) {
            this.shake.duration -= deltaTime;
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            
            if (this.shake.duration <= 0) {
                this.shake.x = 0;
                this.shake.y = 0;
                this.shake.intensity = 0;
            }
        }
    }
    
    updateZoom(deltaTime) {
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            this.zoom += (this.targetZoom - this.zoom) * 0.05;
        }
    }
    
    constrainToBounds() {
        if (this.bounds) {
            this.x = Math.max(this.bounds.minX, Math.min(this.x, this.bounds.maxX - this.width));
            this.y = Math.max(this.bounds.minY, Math.min(this.y, this.bounds.maxY - this.height));
        }
    }
    
    addShake(intensity, duration) {
        this.shake.intensity = Math.max(this.shake.intensity, intensity);
        this.shake.duration = Math.max(this.shake.duration, duration);
    }
    
    setZoom(zoom) {
        this.targetZoom = Math.max(0.5, Math.min(2, zoom));
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x + this.shake.x) * this.zoom,
            y: (worldY - this.y + this.shake.y) * this.zoom
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.zoom + this.x - this.shake.x,
            y: screenY / this.zoom + this.y - this.shake.y
        };
    }
    
    isVisible(x, y, width, height) {
        return x < this.x + this.width / this.zoom &&
               x + width > this.x &&
               y < this.y + this.height / this.zoom &&
               y + height > this.y;
    }
    
    getViewBounds() {
        return {
            left: this.x,
            right: this.x + this.width / this.zoom,
            top: this.y,
            bottom: this.y + this.height / this.zoom
        };
    }
}