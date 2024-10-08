let coins = []; 

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


export function initializeCoins(canvas, playerCar) {
    coins = []; 
    const trackWidth = 400; 
    const trackLeft = (canvas.width - trackWidth) / 2;

    // Define el rango vertical donde pueden aparecer las monedas
    const minY = Math.max(playerCar.y - 500, 30); 
    const maxY = Math.min(playerCar.y + 400, canvas.height - 50); 

    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (trackWidth - 20) + trackLeft + 10;
        const y = Math.random() * (maxY - minY) + minY; 
        coins.push(new Coin(x, y)); 
    }
}




export function updateCoins(ctx, playerCar, coins, pointsWorker) {
   
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        // Verifica la colisión
        if (coin.isCollectedBy(playerCar)) {
            pointsWorker.postMessage({ action: 'addPoints', value: 2 });
            coins.splice(i, 1);  
            console.log("Moneda recogida! Puntos sumados.");
        } else {
            
            coin.draw(ctx);
        }
    }
}


export function getCoins() {
    
    return coins; 
}










