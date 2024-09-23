
export class MovingObstacle {
    constructor(x, y, width, height, speed, canvas) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.canvas = canvas; 
    }

    move() {
        this.y += this.speed;
        if (this.y > this.canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * (this.canvas.width - this.width);
        }
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = "brown";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
