import { Car, CAR_WIDTH, CAR_HEIGHT } from './car.js';
import { MovingObstacle } from './obstacles.js';
import { MAX_SPEED, FINISH_LINE_Y, MAX_AI_CARS } from '../config/config.js';
import { PlayerCar } from './player.js'; // Asegúrate de importar PlayerCar aquí
import { Coin, initializeCoins, updateCoins,getCoins  } from './coins.js';


const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');

let startTime; // Para almacenar el tiempo de inicio
let elapsedTime; // Para almacenar el tiempo transcurrido
let points = 0; // Definir puntos aquí, al comienzo de game.js
let countdownInterval;
let gameStarted = false;
let gameOver = false;
let coins = [];
let obstacles = [];
let playerCar;
let keys = {};
let aiCars = [];



// Iniciar el Worker
let collisionWorker;
if (window.Worker) {
    collisionWorker = new Worker('./worker/collisionWorker.js');
    collisionWorker.onmessage = function (e) {
        const collisions = e.data;
        // Maneja las colisiones aquí
    }
}

function initializePlayerCar() {
    playerCar = new PlayerCar(200, canvas.height - 100, canvas);
}


function updatePlayer() {
    playerCar.update(keys); // Suponiendo que `update` está definido en tu clase `PlayerCar`
}

// Inicializa coches de IA
function initializeAICars() {
    aiCars = [];
    for (let i = 0; i < MAX_AI_CARS; i++) {
        const x = Math.random() * (canvas.width - CAR_WIDTH);
        const speed = 1 + Math.random() * 2;
        aiCars.push(new Car(x, -CAR_HEIGHT, speed));
    }
}

// Inicializa obstáculos
function initializeObstacles() {
    obstacles = [];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 50);
        const y = Math.random() * -canvas.height;
        obstacles.push(new MovingObstacle(x, y, 50, 50, 2, canvas)); // Pasar el canvas aquí
    }
}



// Dibuja obstáculos
function drawObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.move();
        obstacle.draw();
    });
}


// Inicia el juego
function startGame() {
    startTimer(); // Inicializa el temporizador
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none'; // Oculta la pantalla de inicio
    initializePlayerCar(); // Asegúrate de inicializar el coche del jugador
    initializeAICars();
    initializeObstacles();
    gameLoop();
    initializeCoins(canvas); // Inicializa las monedas
    updateTimeAndPoints();
    updateAI();
    updatePlayer();
    drawAICars();
    checkCoinCollision();
    
}

function startTimer() {
    startTime = Date.now(); // Inicializa el tiempo de inicio
}

function updateTimeAndPoints() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Tiempo en segundos
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
    ctx.fillText(`Puntos: ${points}`, 10, 50);
}


// Inicializa las monedas
// function initializeCoins() {
//     coins = [];
//     for (let i = 0; i < 5; i++) {
//         const x = Math.random() * (canvas.width - 20) + 10;
//         const y = Math.random() * (canvas.height - 20) + 10;
//         coins.push(new Coin(x, y));
//     }
// }


// Lógica del bucle del juego
function gameLoop() {
    if (!gameStarted) return;
    if (gameOver) {
        drawEndGameMessage();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrack();
    drawObstacles();

    ctx.fillStyle = "green";
    ctx.fillRect(0, FINISH_LINE_Y, canvas.width, 10);

    updatePlayer();
    playerCar.draw(ctx); // Pasa ctx aquí


    // Dibuja coches AI
    aiCars.forEach(car => {
        car.draw(ctx, 'red'); // Pasa el contexto aquí
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

    // Llama a updateCoins y pasa ctx
    // En el gameLoop
    updateCoins(ctx, playerCar, getCoins()); // Pasa el array de monedas correcto
    points = updateCoins(ctx, playerCar, getCoins(), points);
    requestAnimationFrame(gameLoop);
}

// Comprueba si ha cruzado la línea de meta
function checkFinishLine() {
    if (playerCar.y < FINISH_LINE_Y) {
        endGame("¡Has ganado!");
    }
}

// Termina el juego
function endGame(message) {
    gameOver = true;
    alert(message);
}

// Actualiza el tiempo y los puntos
// function updateTimeAndPoints() {
//     const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
//     ctx.fillStyle = "black";
//     ctx.font = "20px Arial";
//     ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
//     ctx.fillText(`Puntos: ${points}`, 10, 50);
// }

// Dibuja la pista
function drawTrack() {
    ctx.fillStyle = "gray"; // Color de la pista
    ctx.fillRect(50, 0, canvas.width - 100, canvas.height);
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(50, i, 10, 30);
        ctx.fillRect(canvas.width - 60, i, 10, 30);
    }
    ctx.fillStyle = "green"; // Bordes
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
}


// Manejo del evento de inicio
document.getElementById('startButton').addEventListener('click', () => {
    countdown();
});

// Manejador de eventos para las teclas
document.addEventListener('keydown', (event) => {
    keys[event.key] = true; // Marca la tecla como presionada
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false; // Marca la tecla como no presionada
});


// Countdown antes de iniciar
function countdown() {
    let timeLeft = 5;
    document.getElementById('countdown').textContent = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}


// Actualiza y dibuja coches de IA
function updateAI() {
    aiCars.forEach(car => {
        car.y += car.speed;
        if (car.y > canvas.height) {
            car.y = -CAR_HEIGHT;
            car.x = Math.random() * (canvas.width - CAR_WIDTH);
        }
    });
}

function drawAICars() {
    aiCars.forEach(car => {
        car.draw(ctx); // Asegúrate de pasar ctx aquí
    });
}


// Función para comprobar colisiones
function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
        car1.x + car1.width > car2.x &&
        car1.y < car2.y + car2.height &&
        car1.y + car1.height > car2.y;
}

// Función para comprobar la recolección de monedas
function checkCoinCollision(playerCar, coin) {
    return playerCar.x < coin.x + coin.width &&
        playerCar.x + playerCar.width > coin.x &&
        playerCar.y < coin.y + coin.height &&
        playerCar.y + playerCar.height > coin.y;
}

// Lógica del juego
// function updateCoins() {
//     coins.forEach((coin, index) => {
//         coin.draw(ctx); // Pasa `ctx` aquí para dibujar
//         if (coin.isCollectedBy(playerCar)) {
//             coins.splice(index, 1);
//             points += 10; // Actualiza los puntos aquí
//             const newX = Math.random() * (canvas.width - 20) + 10;
//             const newY = Math.random() * (canvas.height - 20) + 10;
//             coins.push(new Coin(newX, newY));
//         }
//     });
// }


// function updateTimeAndPoints() {
//     const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
//     ctx.fillStyle = "black";
//     ctx.font = "20px Arial";
//     ctx.fillText(`Tiempo: ${elapsedTime} s`, 10, 20);
//     ctx.fillText(`Puntos: ${points}`, 10, 50); // Muestra los puntos
// }