import { Car, CAR_WIDTH, CAR_HEIGHT } from './car.js';
import { FINISH_LINE_Y, MAX_SPEED } from '../config/config.js'; 

export class PlayerCar extends Car {
    constructor(x, y, canvas) {
        super(x, y);
        this.canvas = canvas;
    }

    update(keys) {
        if (keys['ArrowUp']) this.y -= MAX_SPEED;
        if (keys['ArrowDown']) this.y += MAX_SPEED;
        if (keys['ArrowLeft']) this.x -= MAX_SPEED;
        if (keys['ArrowRight']) this.x += MAX_SPEED;

        // Limitar el movimiento del coche dentro de los bordes del canvas
        this.x = Math.max(50, Math.min(this.canvas.width - CAR_WIDTH - 50, this.x));
        this.y = Math.max(FINISH_LINE_Y, Math.min(this.canvas.height - CAR_HEIGHT, this.y));
    }

    draw(ctx) {
        super.draw(ctx, 'blue');
    }
}