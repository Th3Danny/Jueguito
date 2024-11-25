import { PlayerCar } from './player.js';
import { initializeRivalCars, updateRivalCars } from './rivalCars.js';
import { initializeCoins, updateCoins } from './coins.js';
import { updateHUD, drawTrack } from './ui.js';
import { startTimer, stopTimer } from './timer.js';

// Inicializa los Workers
const collisionWorker = new Worker('./worker/collisionWorker.js', { type: 'module' });
const pointsWorker = new Worker('./worker/pointsWorker.js', { type: 'module' });
const rivalWorker = new Worker('./worker/rivalWorker.js');
const timeWorker = new Worker('./worker/timeWorker.js');
let maxPoints = parseInt(localStorage.getItem('maxPoints')) || 0; // Recuperar `maxPoints` del localStorage
pointsWorker.postMessage({ action: 'setMaxPoints', maxPoints }); 

// Variables globales del juego
let playerCar, rivalCars, obstacles, coins, points, level, elapsedTime;
let gameStarted = false, gameOver = false;
let animationId; // Identificador de la animación


// Canvas y contexto
const canvas = document.getElementById('raceCanvas');
if (!canvas) {
    throw new Error("Canvas no encontrado. Verifica el ID en el archivo HTML.");
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error("El contexto 2D del canvas no pudo inicializarse.");
}

// Inicialización del estado de las teclas
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Listeners de los Workers
collisionWorker.onmessage = function (e) {
    console.log('Mensaje recibido del Worker:', e.data); // Depuración

    switch (e.data.action) {
        case 'aiCarCollision':
            console.log('Colisión con auto rival detectada');
            endGame("¡Chocaste con un auto rival!");
            break;

        case 'coinCollected':
            console.log(`Colisión con moneda detectada, índice: ${e.data.coinIndex}`);
            pointsWorker.postMessage({ action: 'addPoints', value: 1 });
            coins.splice(e.data.coinIndex, 1); // Elimina la moneda recogida
            break;
    }
};

pointsWorker.onmessage = function (e) {
    console.log('Mensaje recibido del Worker:', e.data); // Depuración

    switch (e.data.action) {
        case 'updatePoints':
            points = e.data.points;
            console.log(`Puntos actualizados: ${points}`); // Depuración
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;

        case 'updateMaxPoints':
            maxPoints = e.data.maxPoints;
            console.log(`Nuevo puntaje máximo: ${maxPoints}`); // Depuración
            localStorage.setItem('maxPoints', maxPoints); // Guarda el puntaje máximo en el almacenamiento local
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;

        case 'levelUp':
            level = e.data.level;
            console.log(`Nuevo nivel alcanzado: ${level}`); // Depuración
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;
    }
};


// Listener del rivalWorker
rivalWorker.onmessage = function (e) {
    console.log('Mensaje recibido del Worker:', e.data);

    if (e.data.action === 'updateRivals') {
        rivalCars = e.data.aiCars;
    }
};

timeWorker.onmessage = function (e) {
    console.log('Mensaje recibido del timeWorker:', e.data);
    if (e.data.action === 'updateTime') {
        elapsedTime = e.data.elapsedTime;
        updateHUD(ctx, elapsedTime, points, level, maxPoints);
    }
};



// Inicialización del juego
function initializeGame() {
    points = 0;
    level = 1;
    elapsedTime = 0;

    playerCar = new PlayerCar(200, canvas.height - 100, canvas, './imgs/car.png');
    rivalCars = initializeRivalCars(canvas);
    coins = initializeCoins(canvas);

    timeWorker.postMessage('start'); // Inicia el temporizador
    startTimer(); // Inicia el temporizador local
    gameLoop(); // Inicia el bucle del juego
}


// function sendCollisionData() {
//     const data = {
//         playerCar: {
//             x: playerCar.x,
//             y: playerCar.y,
//             width: playerCar.width,
//             height: playerCar.height,
//         },
//         aiCars: rivalCars.map(car => ({
//             x: car.x,
//             y: car.y,
//             width: car.width,
//             height: car.height,
//         })),
//         coins: coins.map(coin => ({
//             x: coin.x,
//             y: coin.y,
//             radius: coin.radius,
//         })),
//     };

//     console.log('Enviando datos al collisionWorker:', data); // Depuración
//     collisionWorker.postMessage(data);
// }


// Llama a esta función dentro del bucle principal
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTrack(ctx, canvas);

    updateRivalCars(ctx, rivalCars, playerCar, () => {
        endGame("¡Chocaste con un auto rival!");
    });

    // Actualiza y dibuja las monedas
    updateCoins(ctx, coins, playerCar, (coinValue) => {
        pointsWorker.postMessage({ action: 'addPoints', value: coinValue });
    });

    if (coins.length === 0) { // Si no hay monedas, genera nuevas
        coins.push(...initializeCoins(canvas));
    }

    playerCar.update(keys);
    playerCar.draw(ctx);

    updateHUD(ctx, elapsedTime, points, level, maxPoints);

    animationId = requestAnimationFrame(gameLoop);
}




function endGame(message) {
    gameOver = true;

    // Detén la animación y el temporizador
    if (animationId) cancelAnimationFrame(animationId);
    timeWorker.postMessage('stop'); // Detiene el temporizador en el Worker

    // Limpia el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Muestra el mensaje de "Game Over" en el canvas
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 20);

    // Muestra el botón de reinicio
    const restartButton = document.createElement("button");
    restartButton.innerText = "Reiniciar";
    restartButton.style.position = "absolute";
    restartButton.style.top = `${canvas.offsetTop + canvas.height / 2 + 40}px`;
    restartButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - 50}px`;
    document.body.appendChild(restartButton);

    restartButton.addEventListener("click", () => {
        document.body.removeChild(restartButton);
        resetGame();
    });
}

function resetGame() {
    gameOver = false;
    gameStarted = false;
    points = 0; // Reinicia los puntos
    level = 1; // Reinicia el nivel
    elapsedTime = 0; // Reinicia el tiempo local

    // Limpia el estado de las teclas
    for (const key in keys) {
        keys[key] = false;
    }

    // Detén el temporizador previo
    timeWorker.postMessage('stop');

    // Reinicia los puntos en el Worker
    pointsWorker.postMessage({ action: 'reset' });

    // Reinicia los elementos del juego
    playerCar = new PlayerCar(200, canvas.height - 100, canvas, './imgs/car.png');
    rivalCars = initializeRivalCars(canvas);
    coins = initializeCoins(canvas);

    // Detén cualquier animación previa
    if (animationId) cancelAnimationFrame(animationId);

    // Inicia el temporizador nuevamente
    timeWorker.postMessage('start');
    gameLoop(); // Reinicia la animación
}




// Inicia el juego al presionar el botón de inicio
document.getElementById('startButton').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById('startScreen').style.display = 'none';
        initializeGame();
    }
});
