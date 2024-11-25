import { Car } from './car.js';
import { checkCollision } from './collision.js';
import { TRACK_LEFT, TRACK_WIDTH } from '../config/config.js';

export function initializeRivalCars(canvas, maxCars = 5) {
    const cars = [];
    for (let i = 0; i < maxCars; i++) {
        const x = Math.random() * (TRACK_WIDTH - 20) + TRACK_LEFT + 10; // Generar dentro de la carretera
        const y = Math.random() * -canvas.height; // Generar fuera del canvas
        cars.push(new Car(x, y, 2 + Math.random() * 3, './imgs/rival.png')); // Velocidad aleatoria
    }
    return cars;
}

export function updateRivalCars(ctx, cars, playerCar, onCollision) {
    cars.forEach((car) => {
        car.y += car.speed; // Mueve el auto hacia abajo

        if (car.y > ctx.canvas.height) {
            car.y = -50; // Reinicia la posición fuera del canvas
            car.x = Math.random() * (TRACK_WIDTH - 20) + TRACK_LEFT + 10; // Recalcula la posición dentro de la carretera
        }

        car.draw(ctx); // Dibuja el auto rival

        if (checkCollision(playerCar, car)) {
            onCollision(); // Llama la función de colisión si hay un choque
        }
    });
}
