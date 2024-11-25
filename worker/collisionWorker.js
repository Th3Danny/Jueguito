import { checkCollision, checkCoinCollision } from '../js/collision.js';

onmessage = function (e) {
    console.log('Datos recibidos en collisionWorker:', e.data); // Depuración
    const { playerCar, aiCars, obstacles, coins } = e.data;

    let collisions = {
        aiCar: false,
        obstacle: false,
        coin: null,
    };

    // Detectar colisiones con autos rivales
    aiCars.forEach((car, index) => {
        if (checkCollision(playerCar, car)) {
            collisions.aiCar = true;
            console.log(`Colisión detectada con auto rival en el índice ${index}`); // Depuración
        }
    });

    // Detectar colisiones con monedas
    coins?.forEach((coin, index) => {
        if (checkCoinCollision(playerCar, coin)) {
            collisions.coin = index;
            console.log(`Colisión detectada con moneda en el índice ${index}`); // Depuración
        }
    });

    if (collisions.aiCar) {
        postMessage({ action: 'aiCarCollision' });
    }

    if (collisions.coin !== null) {
        postMessage({ action: 'coinCollected', coinIndex: collisions.coin });
    }
};




