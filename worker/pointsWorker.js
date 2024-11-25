let points = 0;
let maxPoints = 0;
let level = 1;

onmessage = function (e) {
    switch (e.data.action) {
        case 'addPoints':
            points += e.data.value;
            postMessage({ action: 'updatePoints', points });

            if (points > maxPoints) {
                maxPoints = points;
                postMessage({ action: 'updateMaxPoints', maxPoints });
            }
            checkLevelUp();
            break;

        case 'reset':
            points = 0; 
            level = 1; 
            postMessage({ action: 'updatePoints', points });
            break;

        case 'setMaxPoints':
            maxPoints = e.data.maxPoints;
            break;
    }
};

function checkMaxPoints() {
    if (points > maxPoints) {
        maxPoints = points;
        console.log(`Nuevo puntaje máximo alcanzado: ${maxPoints}`); 
        postMessage({ action: 'updateMaxPoints', maxPoints }); 
    }
}

function checkLevelUp() {
    if (points >= 2 * level) {
        level++;
        console.log(`Subiste al nivel: ${level}`); 
        postMessage({ action: 'levelUp', level });
    }
}
