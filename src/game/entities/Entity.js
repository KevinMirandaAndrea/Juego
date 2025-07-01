export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            intersects: function(other) {
                return this.x < other.x + other.width &&
                       this.x + this.width > other.x &&
                       this.y < other.y + other.height &&
                       this.y + this.height > other.y;
            }
        };
    }
    
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    distanceTo(other) {
        const center1 = this.getCenter();
        const center2 = other.getCenter();
        const dx = center1.x - center2.x;
        const dy = center1.y - center2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}