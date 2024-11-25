import { Car } from './car.js';
import { checkCollision } from '../controllers/collision.js';
import { TRACK_LEFT, TRACK_WIDTH } from '../config/config.js';

export function initializeRivalCars(canvas, maxCars = 5) {
    const cars = [];
    for (let i = 0; i < maxCars; i++) {
        const x = Math.random() * (TRACK_WIDTH - 20) + TRACK_LEFT + 10; 
        const y = Math.random() * -canvas.height; 
        cars.push(new Car(x, y, 2 + Math.random() * 3, './imgs/rival.png')); 
    }
    return cars;
}

export function updateRivalCars(ctx, cars, playerCar, onCollision) {
    cars.forEach((car) => {
        car.y += car.speed; 

        if (car.y > ctx.canvas.height) {
            car.y = -50; 
            car.x = Math.random() * (TRACK_WIDTH - 20) + TRACK_LEFT + 10; 
        }

        car.draw(ctx); 

        if (checkCollision(playerCar, car)) {
            onCollision(); 
        }
    });
}
