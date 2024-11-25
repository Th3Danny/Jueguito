import { Car } from './car.js';
import { FINISH_LINE_Y, MAX_SPEED, TRACK_LEFT,TRACK_WIDTH  } from '../config/config.js';

export class PlayerCar extends Car {
    constructor(x, y, canvas, imageSrc) {
        super(x, y, 0, imageSrc);

        if (!canvas || !canvas.getContext) {
            throw new Error("El canvas proporcionado no es válido.");
        }
        this.canvas = canvas;
    }

    update(keys) {
        if (!keys) return;

        if (keys['ArrowUp']) this.y -= MAX_SPEED;
        if (keys['ArrowDown']) this.y += MAX_SPEED;
        if (keys['ArrowLeft']) this.x -= MAX_SPEED;
        if (keys['ArrowRight']) this.x += MAX_SPEED;

        this.limitMovement();
    }

    limitMovement() {
        // Limitar la posición horizontal a los bordes de la carretera (área gris)
        this.x = Math.max(TRACK_LEFT, Math.min(TRACK_LEFT + TRACK_WIDTH - this.width, this.x));
    
        // Limitar la posición vertical dentro del canvas
        this.y = Math.max(FINISH_LINE_Y, Math.min(this.canvas.height - this.height, this.y));
    }
    
    
    resetPosition() {
        this.x = this.canvas.width / 2 - this.width / 2; // Centra el coche horizontalmente
        this.y = this.canvas.height - this.height - 50; // Coloca al jugador en la parte inferior
    }
}
