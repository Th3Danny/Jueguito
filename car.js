class Car {
    constructor(x, y, speed = 0) {
        this.x = x;
        this.y = y;
        this.width = CAR_WIDTH;
        this.height = CAR_HEIGHT;
        this.speed = speed;
        this.exploded = false;
    }

    draw(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }



    move() {
        if (this.direction === 0) {
            this.x += this.speed;
        } else if (this.direction === 180) {
            this.x -= this.speed;
        } else if (this.direction === 90) {
            this.y += this.speed;
        } else if (this.direction === 270) {
            this.y -= this.speed;
        }

        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }

    draw(color = 'blue') {
        if (this.exploded) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 20, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

}