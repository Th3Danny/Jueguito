import { Car, CAR_WIDTH, CAR_HEIGHT } from './car.js';
import { MovingObstacle } from './obstacles.js';
import { MAX_SPEED, FINISH_LINE_Y, MAX_AI_CARS } from '../config/config.js';
import { PlayerCar } from './player.js';
import { Coin, initializeCoins, updateCoins, getCoins } from './coins.js';

const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');

let startTime;
let elapsedTime;
let points = 0; 
let countdownInterval;
let gameStarted = false;
let gameOver = false;
let coins = [];
let displayedPoints = 0; 
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
    if (!gameStarted) return; 
    
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    // Cambia las coordenadas para moverlo fuera de la carretera
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 600, 30);
    ctx.fillText(`Puntos: ${displayedPoints !== undefined ? displayedPoints : 0}`, 600, 60); 
    ctx.fillText(`Nivel: ${level}`, 600, 90);
}



let collisionWorker;
if (window.Worker) {
    collisionWorker = new Worker('./worker/collisionWorker.js');
    collisionWorker.onmessage = function (e) {
        const collisions = e.data;
        
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
            startGame();  
        }
    }, 1000);
}

function startGame() {
    if (gameOver) return; // Evita iniciar si el juego está terminado
    points = 0; 
    level = 1; 
    startTimer();
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';

    initializePlayerCar();
    initializeAICars();
    initializeObstacles();
    updateAndDrawGameElements();
    updatePointsAndLevel();

    initializeCoins(canvas); 
    coins = getCoins(); 
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
        points += 0; // Actualizamos los puntos directamente
        displayedPoints = points; // Actualizamos la variable auxiliar
        console.log(`Puntos: ${displayedPoints}, Nivel: ${level}`);

        if (displayedPoints >= 10 * level) {
            level++;
            console.log(`¡Subiste al nivel ${level}!`);
        }
    }
}


function updateAndDrawCoins() {
    if (!gameStarted) return; // No dibujar monedas si el juego no ha empezado
    // Si no quedan monedas, genera más
    if (coins.length === 0) {
        initializeCoins(canvas); // Genera nuevas monedas
        coins = getCoins();      // Actualiza el array de monedas
        console.log("Nuevas monedas generadas!");
    }

    // Dibuja y verifica colisiones con monedas
    coins.forEach((coin, index) => {
        coin.draw(ctx);
        if (checkCoinCollision(playerCar, coin)) {
            collectCoin();
            coins.splice(index, 1);  // Elimina la moneda recogida
        }
    });
}





// Función para recolectar monedas o puntos
function collectCoin() {
    pointsWorker.postMessage({ action: 'addPoints', value: 2 });
    points += 0; // También actualiza localmente
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

  

    obstacles.forEach(obstacle => {
        
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
    gameStarted = false; // Para asegurarnos de que no siga ejecutándose el bucle del juego
    
    // Limpia el canvas y el HUD
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Opcional: Muestra un mensaje de fin de juego si lo deseas
    console.log(message);
    
    // Vacía el array de monedas para que no se dibujen antes de empezar el nuevo juego
    coins = [];
    
    // Llama a resetGame para preparar el reinicio
    resetGame();
}


function resetGame() {
    gameStarted = false; 
    gameOver = false;
    
    // Reinicia todos los elementos del juego pero NO generes las monedas aún
    points = 0;
    level = 1;
    
    // Limpia el canvas (asegúrate de que no quede ningún dibujo)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Muestra la pantalla de inicio
    document.getElementById('startScreen').style.display = 'block';
    
    // Las monedas NO deben inicializarse hasta que el jugador presione "Start"
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
