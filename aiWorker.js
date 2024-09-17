// aiWorker.js
self.onmessage = function(e) {
    const { aiCars, canvasWidth, canvasHeight, carWidth, carHeight } = e.data;

    aiCars.forEach((car, index) => {
        if (car.exploded) return;

        car.y += car.speed;
        if (car.y > canvasHeight) {
            aiCars.splice(index, 1);
            const newX = Math.random() * (canvasWidth - carWidth);
            const newSpeed = 1 + Math.random() * 2;
            aiCars.push({ x: newX, y: -carHeight, speed: newSpeed });
        }
    });

    self.postMessage({ aiCars });
}
