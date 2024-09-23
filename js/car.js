
export const CAR_WIDTH = 30;
export const CAR_HEIGHT = 50;

export class Car {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = CAR_WIDTH; 
        this.height = CAR_HEIGHT; 
    }

    draw(ctx) { 
        ctx.fillStyle = "blue"; 
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}



