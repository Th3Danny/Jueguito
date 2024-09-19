// Crea el Worker
const collisionWorker = new Worker('collisionWorker.js'); // Cambia la ruta según sea necesario

// Maneja los mensajes del Worker
collisionWorker.onmessage = function (e) {
    const collisions = e.data;
    // Maneja las colisiones aquí
};

// En el bucle del juego
function gameLoop() {
    if (!gameStarted) return;
    if (gameOver) {
        drawEndGameMessage();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrack();
    updateObstacles();
    updateCoins();
    playerCar.update(keys);
    playerCar.draw();
    checkFinishLine();
    updateAI();
    drawAICars();
    updateTimeAndPoints();

    collisionWorker.postMessage({
        playerCar: playerCar,
        aiCars: aiCars,
        obstacles: obstacles,
        coins: coins
    });

    requestAnimationFrame(gameLoop);
}
