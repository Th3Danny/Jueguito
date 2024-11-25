let startTime = 0; 
let timerInterval = null; 


 //Inicia el temporizador.
 
export function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); 
    }

    startTime = Date.now(); 
    timerInterval = setInterval(() => {
        
    }, 1000); 
}


//Detiene el temporizador.
 
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); 
        timerInterval = null; 
    }
}

/**
 * 
 * @returns {number} Tiempo transcurrido en segundos.
 */
export function updateTime() {
    if (!startTime) {
        console.warn("El temporizador no ha sido iniciado.");
        return 0;
    }
    return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Renderiza el tiempo transcurrido y los puntos en el canvas.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} points 
 */
export function updateTimeAndPoints(ctx, points) {
    const elapsedTime = updateTime(); 
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
    ctx.fillText(`Puntos: ${points}`, 10, 50);
}
