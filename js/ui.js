export function updateHUD(ctx, elapsedTime, points, level, maxPoints) {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 600, 30);
    ctx.fillText(`Puntos: ${points}`, 600, 60);
    ctx.fillText(`Nivel: ${level}`, 600, 90);
    ctx.fillText(`Máximo Puntos: ${maxPoints}`, 600, 120);
}



export function drawTrack(ctx, canvas) {
    // Fondo gris para la pista
    ctx.fillStyle = "gray";
    ctx.fillRect(100, 0, 600, canvas.height); // Dibuja la pista

    // Líneas blancas en los bordes de la pista
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(100, i, 10, 30); // Línea izquierda
        ctx.fillRect(690, i, 10, 30); // Línea derecha
    }

    // Bordes verdes para el césped
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, 100, canvas.height); // Césped izquierdo
    ctx.fillRect(700, 0, canvas.width - 700, canvas.height); // Césped derecho
}
