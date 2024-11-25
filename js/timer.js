let startTime = 0; // Marca el inicio del temporizador
let timerInterval = null; // Intervalo del temporizador

/**
 * Inicia el temporizador.
 */
export function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Detén cualquier temporizador previo
    }

    startTime = Date.now(); // Establece el tiempo inicial
    timerInterval = setInterval(() => {
        console.log(`Tiempo transcurrido: ${updateTime()} segundos`);
    }, 1000); // Actualiza cada segundo (solo para pruebas locales)
}

/**
 * Detiene el temporizador.
 */
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Detén el temporizador
        timerInterval = null; // Limpia la referencia al intervalo
    }
}

/**
 * Devuelve el tiempo transcurrido desde que se inició el temporizador.
 * @returns {number} Tiempo transcurrido en segundos.
 */
export function updateTime() {
    if (!startTime) {
        console.warn("El temporizador no ha sido iniciado.");
        return 0;
    }
    return Math.floor((Date.now() - startTime) / 1000); // Devuelve el tiempo en segundos
}

/**
 * Renderiza el tiempo transcurrido y los puntos en el canvas.
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas para dibujar.
 * @param {number} points - Puntos actuales del jugador.
 */
export function updateTimeAndPoints(ctx, points) {
    const elapsedTime = updateTime(); // Usar `updateTime` para obtener el tiempo
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
    ctx.fillText(`Puntos: ${points}`, 10, 50);
}
