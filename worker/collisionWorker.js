import { checkCollision, checkCoinCollision } from '../controllers/collision.js';

onmessage = function (e) {
    // console.log('Mensaje recibido en collisionWorker:', e.data); 

    const { playerCar, aiCars, coins } = e.data;
    let collisions = {
        aiCar: false,
        coin: null
    };

    // Detectar colisiones con autos rivales
    aiCars.forEach((car, index) => {
        if (checkCollision(playerCar, car)) {
            collisions.aiCar = true;
            console.log(`Colisión detectada con auto rival en el índice ${index}`); 
        }
    });

    // Detectar colisiones con monedas
    coins?.forEach((coin, index) => {
        if (checkCoinCollision(playerCar, coin)) {
            collisions.coin = index;
            console.log(`Colisión detectada con moneda en el índice ${index}`);
        }
    });

    if (collisions.aiCar) {
        postMessage({ action: 'rivalCarCollision' });
    }

    if (collisions.coin !== null) {
        postMessage({ action: 'coinCollected', coinIndex: collisions.coin });
    }
};

