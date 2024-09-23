let workerPoints = 0;
let level = 1;
self.onmessage = function (e) {
    switch (e.data.action) {
        case 'addPoints':
            workerPoints += e.data.value;
            postMessage({ action: 'updatePoints', points: workerPoints });
            checkLevelUp();
            break;
        
        case 'reset':
            workerPoints = 0; // Reinicia los puntos
            level = 1; // Reinicia el nivel
            postMessage({ action: 'updatePoints', points: workerPoints });
            break;
    }
};


function checkLevelUp() {
    if (workerPoints >= 10 * level) { 
        level++;
        postMessage({ action: 'levelUp', level });
    }
}
