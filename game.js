
const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');

const MAX_SPEED = 4;
const FINISH_LINE_Y = 50;
const MAX_AI_CARS = 10;
const CAR_WIDTH = 30;
const CAR_HEIGHT = 50;

let aiCars = [];
let obstacles = [];
let gameOver = false;
let message = "";
let gameStarted = false;
let countdownInterval;
let aiWorker;

const playerCar = new Car(200, canvas.height - 100);
let keys = {};

// Clase para los obstáculos en movimiento
class MovingObstacle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.fillStyle = "brown";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Funciones para inicializar los coches AI y los obstáculos
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
        obstacles.push(new MovingObstacle(x, y, 50, 50, 2));
    }
}

// Función para actualizar los coches AI
function updateAI() {
    if (aiWorker) {
        aiWorker.postMessage({
            aiCars: aiCars.map(car => ({ x: car.x, y: car.y, speed: car.speed, exploded: car.exploded })),
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            carWidth: CAR_WIDTH,
            carHeight: CAR_HEIGHT
        });
    }
}

// Función para actualizar la posición del coche del jugador
function updatePlayer() {
    if (keys['ArrowUp']) playerCar.y -= MAX_SPEED;
    if (keys['ArrowDown']) playerCar.y += MAX_SPEED;
    if (keys['ArrowLeft']) playerCar.x -= MAX_SPEED;
    if (keys['ArrowRight']) playerCar.x += MAX_SPEED;

    // Limitar el movimiento del jugador dentro del canvas
    playerCar.x = Math.max(50, Math.min(canvas.width - CAR_WIDTH - 50, playerCar.x));
    playerCar.y = Math.max(FINISH_LINE_Y, Math.min(canvas.height - CAR_HEIGHT, playerCar.y));
}

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
    playerCar.draw('blue');
    checkFinishLine();
    updateAI();
    aiCars.forEach(car => {
        car.draw('red');
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

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';
    initializeAICars();
    initializeObstacles();
    gameLoop();
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

document.getElementById('startButton').addEventListener('click', () => {
    countdown();
});

function drawTrack() {
    ctx.fillStyle = "gray";
    ctx.fillRect(50, 0, canvas.width - 100, canvas.height);
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(50, i, 10, 30);
        ctx.fillRect(canvas.width - 60, i, 10, 30);
    }
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.move();
        obstacle.draw();
    });
}

function endGame(endMessage) {
    gameOver = true;
    message = endMessage;
}

function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

function checkFinishLine() {
    if (playerCar.y < FINISH_LINE_Y) {
        endGame("¡Has ganado!");
    }
}

function drawEndGameMessage() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
}

// Manejo de eventos de teclado
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Configuración del trabajador
if (window.Worker) {
    aiWorker = new Worker('aiWorker.js');
    aiWorker.onmessage = function(e) {
        aiCars = e.data.aiCars.map(car => new Car(car.x, car.y, car.speed));
    };
}
