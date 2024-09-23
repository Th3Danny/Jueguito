import { Car } from './car.js';
import { MovingObstacle } from './obstacles.js';
import {  MAX_AI_CARS } from '../config/config.js';
import { PlayerCar } from './player.js';
import { initializeCoins, updateCoins, getCoins } from './coins.js';

const canvas = document.getElementById('raceCanvas');
const ctx = canvas.getContext('2d');

let playerCar;
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
let keys = {};
let aiCars = [];
let pointsWorker;
let maxPoints = 0;
let timeWorker = new Worker('./worker/timeWorker.js');

if (window.Worker) {
    try {
        pointsWorker = new Worker('./worker/pointsWorker.js');
        
        pointsWorker.onmessage = function (e) {
            if (e.data.action === 'updatePoints') {
                points = e.data.points !== undefined ? e.data.points : points;
                displayedPoints = points;
                console.log(`Puntos actualizados: ${displayedPoints}`);
                updateHUD();
            }
            if (e.data.action === 'levelUp') {
                level = e.data.level;
                console.log(`Nivel actualizado: ${level}`);
                updateHUD();
            }
            if (e.data.action === 'loadPoints') {
                points = e.data.points;
                displayedPoints = points;
                updateHUD();
            }
        };



    } catch (error) {
        console.error("Error al inicializar el worker:", error);
    }
} else {
    console.error("Los Web Workers no son soportados en este navegador.");
}


timeWorker.onmessage = function (e) {
    if (e.data.action === 'updateTime') {
        updateTimeAndPoints(e.data.time, points);
    }
};


function updateHUD() {
    if (!gameStarted) return;

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 600, 30);
    ctx.fillText(`Puntos: ${displayedPoints}`, 600, 60);
    ctx.fillText(`Nivel: ${level}`, 600, 90);
    ctx.fillText(`Máximo Puntos: ${maxPoints}`, 600, 120); 
}




let collisionWorker;
if (window.Worker) {
    collisionWorker = new Worker('./worker/collisionWorker.js');
    collisionWorker.onmessage = function (e) {
        const collisions = e.data;

    };
}

function initializePlayerCar() {
    playerCar = new PlayerCar(200, canvas.height - 100, canvas, './imgs/images-removebg-preview.png');
}



function updatePlayer() {
    playerCar.update(keys);
}

function initializeAICars() {
    const CAR_WIDTH = 600;
    const CAR_HEIGHT = 500;
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

document.getElementById('startButton').addEventListener('click', () => {
    if (!countdownInterval) { 
        countdown();
    }
});

function countdown() {
    let timeLeft = 5;
    document.getElementById('countdown').textContent = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null; 
            startGame();
        }
    }, 1000);
}


function startGame() {
    if (gameOver) return; 
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

    pointsWorker.postMessage({ action: 'reset' }); 
    
    loadMaxPoints();
    initializeCoins(canvas, playerCar);
    coins = getCoins();
    collectCoin();
    pointsWorker.postMessage({ action: 'reset' });
    timeWorker.postMessage('start');
    gameLoop();
    pointsWorker.postMessage({ action: 'reset' });
}

function loadMaxPoints() {
    const storedMaxPoints = localStorage.getItem('maxPoints');
    maxPoints = storedMaxPoints ? parseInt(storedMaxPoints) : 0; 
    pointsWorker.postMessage({ action: 'setMaxPoints', maxPoints }); 
    updateHUD(); 
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
        points += 0; 
        displayedPoints = points; 
        console.log(`Puntos: ${displayedPoints}, Nivel: ${level}`);

        if (displayedPoints >= 10 * level) {
            level++;
            console.log(`¡Subiste al nivel ${level}!`);
        }
    }
}


function updateAndDrawCoins() {
    
    if (!gameStarted) return;

    
    if (coins.length === 0) {
        initializeCoins(canvas, playerCar);
        coins = getCoins();
        console.log("Nuevas monedas generadas!");
    }

    
    coins.forEach((coin, index) => {
        coin.draw(ctx);
        if (checkCoinCollision(playerCar, coin)) {
            collectCoin();
            coins.splice(index, 1);  
        }
    });
}


// Función para recolectar monedas o puntos
function collectCoin() {
    const coinValue = 1; 
    pointsWorker.postMessage({ action: 'addPoints', value: coinValue });
    points += 0;
    displayedPoints = points;
    
    pointsWorker.postMessage({ action: 'checkMaxPoints' });
    updateHUD();
}




function updateAndDrawGameElements() {
    updateTime();
    drawTrack();

    updateHUD();
}


function gameLoop() {

    if (gameOver) return; 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    updateAndDrawGameElements();
    updateAndDrawCoins();  
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
            collectCoin(); 
            coins.splice(index, 1);  
        }
    });

    points = updateCoins(ctx, playerCar, getCoins(), points);
    updateHUD();

    if (gameStarted) {
        requestAnimationFrame(gameLoop);  
    }
}

function endGame(message) {
    gameOver = true;
    gameStarted = false;  

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   
    console.log(message);

   
    if (displayedPoints > maxPoints) {
        maxPoints = displayedPoints;
        localStorage.setItem('maxPoints', maxPoints); 
    }

    
    coins = [];

    
    resetGame();
}



function resetGame() {
    gameStarted = false;
    gameOver = false;

    
    points = 0; 
    level = 1; 

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    document.getElementById('startScreen').style.display = 'block';

    
    coins = [];

    
    displayedPoints = points;
    updateHUD();
}




function drawTrack() {
    const trackWidth = 600;
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
    const distX = (car1.x + car1.width / 2) - (car2.x + car2.width / 2);
    const distY = (car1.y + car1.height / 2) - (car2.y + car2.height / 2);
    
    const distance = Math.sqrt(distX * distX + distY * distY);
    const collisionDistance = (Math.min(car1.width, car1.height) / 2) + (Math.min(car2.width, car2.height) / 2);
    
    return distance < collisionDistance;
}


function checkCoinCollision(playerCar, coin) {
    const distX = playerCar.x + playerCar.width / 2 - coin.x;
    const distY = playerCar.y + playerCar.height / 2 - coin.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < coin.radius + Math.min(playerCar.width, playerCar.height) / 2;
}



// Manejador de eventos para las teclas
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
