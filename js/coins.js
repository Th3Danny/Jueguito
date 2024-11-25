import { checkCoinCollision } from './collision.js';
import { TRACK_LEFT,TRACK_WIDTH  } from '../config/config.js';

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
}

export function initializeCoins(canvas) {
    const coins = [];
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (TRACK_WIDTH - 20) + TRACK_LEFT + 10; 
        const y = Math.random() * (canvas.height - 100); 
        coins.push(new Coin(x, y));
    }
    return coins;
}




export function updateCoins(ctx, coins, playerCar, onCoinCollected) {
    coins.forEach((coin, index) => {
        if (checkCoinCollision(playerCar, coin)) { 
            onCoinCollected(1); 
            coins.splice(index, 1); 
        } else {
            coin.draw(ctx); 
        }
    });
}





