

// Implementar funciones adicionales para el jugador si es necesario
function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

function checkFinishLine() {
    if (playerCar.y < finishLineY) {
        endGame("¡Has ganado!");
    }
}

function drawEndGameMessage() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
}
