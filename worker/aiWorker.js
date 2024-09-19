onmessage = function(e) {
    const { aiCars, canvasWidth, canvasHeight, carWidth, carHeight } = e.data;

    aiCars.forEach(car => {
        car.y += car.speed;
        if (car.y > canvasHeight) {
            car.y = -carHeight;
            car.x = Math.random() * (canvasWidth - carWidth);
        }
    });

    postMessage({ aiCars });
};
