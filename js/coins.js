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
    coins = []; // Asegúrate de que coins sea un nuevo array
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 20) + 10;
        const y = Math.random() * (canvas.height - 20) + 10;
        coins.push(new Coin(x, y));
    }
}

export function getCoins() {
    return coins; // Agrega una función para obtener el array de monedas
}




// En coins.js
export function updateCoins(ctx, playerCar, coins, points) {
    coins.forEach((coin, index) => {
        coin.draw(ctx);
        if (coin.isCollectedBy(playerCar)) {
            coins.splice(index, 1);
            points += 10;
            const newX = Math.random() * (ctx.canvas.width - 20) + 10;
            const newY = Math.random() * (ctx.canvas.height - 20) + 10;
            coins.push(new Coin(newX, newY));
        }
    });
    return points; // Devuelve los puntos actualizados
}










