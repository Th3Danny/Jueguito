function initializeAICars() {
    aiCars = [];
    for (let i = 0; i < MAX_AI_CARS; i++) {
        const x = Math.random() * (canvas.width - CAR_WIDTH);
        const speed = 3 + Math.random() * 3;
        aiCars.push(new Car(x, -CAR_HEIGHT, speed));
    }
}

function updateAI() {
    if (aiWorker) {
        aiWorker.postMessage({
            aiCars: aiCars.map(car => ({
                x: car.x,
                y: car.y,
                speed: car.speed,
                exploded: car.exploded
            })),
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            carWidth: CAR_WIDTH,
            carHeight: CAR_HEIGHT
        });
    }
}

aiWorker.onmessage = function (e) {
    aiCars = e.data.aiCars.map(car => new Car(car.x, car.y, car.speed));
};

function drawAICars() {
    aiCars.forEach(car => {
        car.draw('red');
        if (checkCollision(playerCar, car)) {
            car.exploded = true;
            endGame("¡Has perdido!");
        }
    });
}
