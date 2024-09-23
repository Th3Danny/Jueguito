import { Car } from './car.js';
import { FINISH_LINE_Y, MAX_SPEED } from '../config/config.js';

export class PlayerCar extends Car {
    constructor(x, y, canvas, imageSrc) {
        super(x, y, 0, imageSrc); 
        this.canvas = canvas;
    }

    update(keys) {
        if (keys['ArrowUp']) this.y -= MAX_SPEED;
        if (keys['ArrowDown']) this.y += MAX_SPEED;
        if (keys['ArrowLeft']) this.x -= MAX_SPEED;
        if (keys['ArrowRight']) this.x += MAX_SPEED;

        // Limitar el movimiento del coche dentro de los bordes del canvas
        this.x = Math.max(50, Math.min(this.canvas.width - this.width - 50, this.x));
        this.y = Math.max(FINISH_LINE_Y, Math.min(this.canvas.height - this.height, this.y));
    }
}
