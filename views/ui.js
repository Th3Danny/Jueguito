export function updateHUD(ctx, elapsedTime, points, level, maxPoints) {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 600, 30);
    ctx.fillText(`Puntos: ${points}`, 600, 60);
    ctx.fillText(`Nivel: ${level}`, 600, 90);
    ctx.fillText(`Máximo Puntos: ${maxPoints}`, 600, 120);
}

export function drawTrack(ctx, canvas) {
    ctx.fillStyle = "gray";
    ctx.fillRect(100, 0, 600, canvas.height); 

   
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(100, i, 10, 30); 
        ctx.fillRect(690, i, 10, 30); 
    }

    
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, 100, canvas.height); 
    ctx.fillRect(700, 0, canvas.width - 700, canvas.height); 
}
