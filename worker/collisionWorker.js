// collisionWorker.js
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

// Function to check collisions
function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

// Function to check coin collection
function checkCoinCollision(playerCar, coin) {
    return playerCar.x < coin.x + coin.width &&
           playerCar.x + playerCar.width > coin.x &&
           playerCar.y < coin.y + coin.height &&
           playerCar.y + playerCar.height > coin.y;
}
