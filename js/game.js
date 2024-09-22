import { Car, CAR_WIDTH, CAR_HEIGHT } from './car.js';
import { MovingObstacle } from './obstacles.js';
import { MAX_SPEED, FINISH_LINE_Y, MAX_AI_CARS } from '../config/config.js';
import { PlayerCar } from './player.js';
import { Coin, initializeCoins, updateCoins, getCoins } from './coins.js';

const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');

let startTime;
let elapsedTime;
let points = 0; // Inicializamos correctamente los puntos a 0
let countdownInterval;
let gameStarted = false;
let gameOver = false;
let coins = [];
let displayedPoints = 0; // Variable para almacenar los puntos que se muestran en el HUD
let level = 1;
let obstacles = [];
let playerCar;
let keys = {};
let aiCars = [];

let pointsWorker;
let timeWorker = new Worker('./worker/timeWorker.js');

if (window.Worker) {
    try {
        pointsWorker = new Worker('./worker/pointsWorker.js');
        
        pointsWorker.onmessage = function (e) {
            if (e.data.action === 'updatePoints') {
                points = e.data.points !== undefined ? e.data.points : points;
                displayedPoints = points; // Actualiza la variable auxiliar
                console.log(`Puntos actualizados: ${displayedPoints}`); 
                updateHUD(); // Actualiza el HUD con los puntos
            }
            if (e.data.action === 'levelUp') {
                level = e.data.level;
                console.log(`Nivel actualizado: ${level}`);
                updateHUD();
            }
        
};
        
    } catch (error) {
        console.error("Error al inicializar el worker:", error);
    }
} else {
    console.error("Los Web Workers no son soportados en este navegador.");
}

// Manejar mensajes del Worker de tiempo
timeWorker.onmessage = function (e) {
    if (e.data.action === 'updateTime') {
        updateTimeAndPoints(e.data.time, points);
    }
};

// Actualiza el HUD (pantalla de información)
function updateHUD() {
    ctx.clearRect(0, 0, 200, 100); // Borra el área del HUD
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 10, 30);
    ctx.fillText(`Puntos: ${displayedPoints !== undefined ? displayedPoints : 0}`, 10, 60); // Usa displayedPoints
    ctx.fillText(`Nivel: ${level}`, 10, 90);
}


let collisionWorker;
if (window.Worker) {
    collisionWorker = new Worker('./worker/collisionWorker.js');
    collisionWorker.onmessage = function (e) {
        const collisions = e.data;
        // Manejar colisiones aquí
    };
}

function initializePlayerCar() {
    playerCar = new PlayerCar(200, canvas.height - 100, canvas);
}

function updatePlayer() {
    playerCar.update(keys);
}

function initializeAICars() {
    aiCars = [];
    for (let i = 0; i < MAX_AI_CARS; i++) {
        const x = Math.random() * (canvas.width - CAR_WIDTH);
        const speed = 1 + Math.random() * 2;
        aiCars.push(new Car(x, -CAR_HEIGHT, speed));
    }
}

function initializeObstacles() {
    obstacles = [];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 50);
        const y = Math.random() * -canvas.height;
        obstacles.push(new MovingObstacle(x, y, 50, 50, 2, canvas));
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.move();
        obstacle.draw();
    });
}

function countdown() {
    let timeLeft = 5;
    document.getElementById('countdown').textContent = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            startGame();  // Inicia el juego después de la cuenta regresiva
        }
    }, 1000);
}

function startGame() {
    points = 0; // Reinicia los puntos al iniciar el juego
    level = 1; // Reinicia el nivel
    startTimer();
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';

    initializePlayerCar();
    initializeAICars();
    initializeObstacles();
    updateAndDrawGameElements();
    updatePointsAndLevel();

    initializeCoins(canvas); // Inicializa las monedas aquí
    coins = getCoins(); // Obtén las monedas inicializadas
    collectCoin();
    pointsWorker.postMessage({ action: 'reset' });
    timeWorker.postMessage('start');
    gameLoop();
}

function startTimer() {
    startTime = Date.now();
}

function updateTime() {
    if (gameStarted) {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    }
}

function updatePointsAndLevel() {
    if (gameStarted) {
        points += 2; // Actualizamos los puntos directamente
        displayedPoints = points; // Actualizamos la variable auxiliar
        console.log(`Puntos: ${displayedPoints}, Nivel: ${level}`);

        if (displayedPoints >= 10 * level) {
            level++;
            console.log(`¡Subiste al nivel ${level}!`);
        }
    }
}


function updateAndDrawCoins() {
    coins.forEach((coin, index) => {
        coin.draw(ctx);
        if (checkCoinCollision(playerCar, coin)) {
            pointsWorker.postMessage({ action: 'addPoints', value: 2 });
            coins.splice(index, 1);
            console.log("Moneda recogida! Puntos sumados.");
        }
    });
}




// Función para recolectar monedas o puntos
function collectCoin() {
    pointsWorker.postMessage({ action: 'addPoints', value: 2 });
    points += 2; // También actualiza localmente
    displayedPoints = points; // Asegúrate de que se refleje en displayedPoints
    updateHUD(); // Actualiza el HUD inmediatamente
}



// Función para redibujar el HUD y la interfaz del juego
function updateAndDrawGameElements() {
    updateTime();
    drawTrack();

    // Actualiza el HUD en esta función
    updateHUD();
}


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    updateAndDrawGameElements();
    updateAndDrawCoins();  // Asegúrate de que esto se llame aquí
    drawObstacles();
    updatePlayer();
    playerCar.draw(ctx);

    aiCars.forEach(car => {
        car.draw(ctx, 'red');
        if (checkCollision(playerCar, car)) {
            car.exploded = true;
            endGame("¡Has perdido!");
        }
    });

    obstacles.forEach(obstacle => {
        obstacle.move();
        obstacle.draw();
        if (checkCollision(playerCar, obstacle)) {
            endGame("¡Has perdido por chocar con un obstáculo!");
        }
    });

    coins.forEach((coin, index) => {
        coin.draw(ctx);
        if (checkCoinCollision(playerCar, coin)) {
            collectCoin(); // Llama a collectCoin cuando recojas la moneda
            coins.splice(index, 1);  // Elimina la moneda recogida
        }
    });

    points = updateCoins(ctx, playerCar, getCoins(), points); // Actualizamos los puntos con las monedas

     // Aquí se actualiza el HUD
     updateHUD(); 

    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame(message) {
    gameOver = true;
    alert(message);
}

function drawTrack() {
    const trackWidth = 400;
    const trackLeft = (canvas.width - trackWidth) / 2;
    const trackRight = trackLeft + trackWidth;

    ctx.fillStyle = "gray";
    ctx.fillRect(trackLeft, 0, trackWidth, canvas.height);

    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(trackLeft, i, 10, 30);
        ctx.fillRect(trackRight - 10, i, 10, 30);
    }

    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, trackLeft, canvas.height);
    ctx.fillRect(trackRight, 0, canvas.width - trackRight, canvas.height);
}

function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
        car1.x + car1.width > car2.x &&
        car1.y < car2.y + car2.height &&
        car1.y + car1.height > car2.y;
}

function checkCoinCollision(playerCar, coin) {
    const distX = playerCar.x + playerCar.width / 2 - coin.x;
    const distY = playerCar.y + playerCar.height / 2 - coin.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < coin.radius + Math.min(playerCar.width, playerCar.height) / 2;
}



// Manejo del evento de inicio
document.getElementById('startButton').addEventListener('click', () => {
    countdown();
});

// Manejador de eventos para las teclas
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
