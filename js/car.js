
export const CAR_WIDTH = 30;
export const CAR_HEIGHT = 50;

export class Car {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = CAR_WIDTH; // Asegúrate de que CAR_WIDTH esté definido
        this.height = CAR_HEIGHT; // Asegúrate de que CAR_HEIGHT esté definido
    }

    draw(ctx) { // Asegúrate de que ctx sea pasado aquí
        ctx.fillStyle = "blue"; // Cambia el color si lo necesitas
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}



