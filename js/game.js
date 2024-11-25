import { PlayerCar } from './player.js';
import { initializeRivalCars, updateRivalCars } from './rivalCars.js';
import { initializeCoins, updateCoins } from './coins.js';
import { updateHUD, drawTrack } from './ui.js';
import { startTimer} from './timer.js';

// Inicializa los Workers
const collisionWorker = new Worker('./worker/collisionWorker.js', { type: 'module' });
const pointsWorker = new Worker('./worker/pointsWorker.js', { type: 'module' });
const rivalWorker = new Worker('./worker/rivalWorker.js');
const timeWorker = new Worker('./worker/timeWorker.js');
let maxPoints = parseInt(localStorage.getItem('maxPoints')) || 0; 
pointsWorker.postMessage({ action: 'setMaxPoints', maxPoints }); 


let playerCar, rivalCars, coins, points, level, elapsedTime;
let gameStarted = false, gameOver = false;
let animationId; 


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
            console.log('Colisión con un auto rival detectada');
            endGame("¡Chocaste con un auto rival!");
            break;

        case 'coinCollected':
            console.log(`Moneda recogida, índice: ${e.data.coinIndex}`);
            pointsWorker.postMessage({ action: 'addPoints', value: 1 });
            coins.splice(e.data.coinIndex, 1); // Elimina la moneda recogida
            break;

        default:
            console.log('Acción desconocida recibida del Worker:', e.data.action);
    }
};


pointsWorker.onmessage = function (e) {
    console.log('Mensaje recibido del Worker:', e.data); 

    switch (e.data.action) {
        case 'updatePoints':
            points = e.data.points;
            console.log(`Puntos actualizados: ${points}`); 
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;

        case 'updateMaxPoints':
            maxPoints = e.data.maxPoints;
            console.log(`Nuevo puntaje máximo: ${maxPoints}`); 
            localStorage.setItem('maxPoints', maxPoints); 
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;

        case 'levelUp':
            level = e.data.level;
            console.log(`Nuevo nivel alcanzado: ${level}`); 
            updateHUD(ctx, elapsedTime, points, level, maxPoints);
            break;
    }
};

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

    timeWorker.postMessage('start'); 
    startTimer(); 
    gameLoop(); 
}


function sendCollisionData() {
    collisionWorker.postMessage({
        playerCar: {
            x: playerCar.x,
            y: playerCar.y,
            width: playerCar.width,
            height: playerCar.height
        },
        aiCars: rivalCars.map(car => ({
            x: car.x,
            y: car.y,
            width: car.width,
            height: car.height
        })),
        coins: coins.map(coin => ({
            x: coin.x,
            y: coin.y,
            radius: coin.radius
        }))
    });
}



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

    if (coins.length === 0) { 
        coins.push(...initializeCoins(canvas));
    }

    playerCar.update(keys);
    playerCar.draw(ctx);
    
    updateHUD(ctx, elapsedTime, points, level, maxPoints);

     // Enviar datos al collisionWorker
    sendCollisionData();

    animationId = requestAnimationFrame(gameLoop);
}

function endGame(message) {
    gameOver = true;

    // Detén la animación y el temporizador
    if (animationId) cancelAnimationFrame(animationId);
    timeWorker.postMessage('stop'); 

    // Limpia el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Muestra el mensaje de "Game Over" en el canvas
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 20);

   
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
    points = 0; 
    level = 1; 
    elapsedTime = 0; 

    // Limpia el estado de las teclas
    for (const key in keys) {
        keys[key] = false;
    }

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
    gameLoop(); 
}

document.getElementById('startButton').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById('startScreen').style.display = 'none';
        initializeGame();
    }
});
