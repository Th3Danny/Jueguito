
export function checkCollision(obj1, obj2) {
    const margin = 10; 
    return (
        obj1.x + margin < obj2.x + obj2.width - margin &&
        obj1.x + obj1.width - margin > obj2.x + margin &&
        obj1.y + margin < obj2.y + obj2.height - margin &&
        obj1.y + obj1.height - margin > obj2.y + margin
    );
}

// Colisión circular para monedas
export function checkCoinCollision(playerCar, coin) {
    const distX = playerCar.x + playerCar.width / 2 - coin.x;
    const distY = playerCar.y + playerCar.height / 2 - coin.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < coin.radius + Math.min(playerCar.width, playerCar.height) / 2;
}

// Colisión circular genérica
export function checkCircularCollision(obj1, obj2) {
    const distX = obj1.x + obj1.width / 2 - (obj2.x + obj2.width / 2);
    const distY = obj1.y + obj1.height / 2 - (obj2.y + obj2.height / 2);
    const distance = Math.sqrt(distX * distX + distY * distY);

    const radius1 = Math.min(obj1.width, obj1.height) / 2;
    const radius2 = Math.min(obj2.width, obj2.height) / 2;

    return distance < radius1 + radius2;
}
