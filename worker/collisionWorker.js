
onmessage = function (e) {
    const { playerCar, aiCars, obstacles, coins } = e.data;

    let collisions = {
        aiCar: null,
        obstacle: null,
        coin: null
    };

    aiCars.forEach(car => {
        if (checkCollision(playerCar, car)) {
            collisions.aiCar = car;
        }
    });

    obstacles.forEach(obstacle => {
        if (checkCollision(playerCar, obstacle)) {
            collisions.obstacle = obstacle;
        }
    });

    coins.forEach(coin => {
        if (checkCoinCollision(playerCar, coin)) {
            collisions.coin = coin;
        }
    });

    postMessage(collisions);
};


