export function startTimer() {
    startTime = Date.now();
}

export function updateTimeAndPoints() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Tiempo en segundos
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
    ctx.fillText(`Puntos: ${points}`, 10, 50);
}
