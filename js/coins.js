let coins = []; // Declarar la variable coins

export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isCollectedBy(car) {
        const distX = car.x + car.width / 2 - this.x;
        const distY = car.y + car.height / 2 - this.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < this.radius + Math.min(car.width, car.height) / 2;
    }
    
}




export function initializeCoins(canvas) {
    
    coins = []; // Reinicia el array de monedas
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 20) + 10;
        const y = Math.random() * (canvas.height - 20) + 10;
        coins.push(new Coin(x, y)); // Asegúrate de usar el constructor
    }
}


export function updateCoins(ctx, playerCar, coins, pointsWorker) {
    // Recorre las monedas en sentido inverso para eliminar correctamente
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        // Verifica la colisión
        if (coin.isCollectedBy(playerCar)) {
            pointsWorker.postMessage({ action: 'addPoints', value: 2 });
            coins.splice(i, 1);  // Elimina la moneda recogida
            console.log("Moneda recogida! Puntos sumados.");
        } else {
            // Dibuja la moneda si no fue recogida
            coin.draw(ctx);
        }
    }
}





export function getCoins() {
    return coins; // Agrega una función para obtener el array de monedas
}










