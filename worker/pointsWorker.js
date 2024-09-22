let workerPoints = 0;
let level = 1;
self.onmessage = function (e) {
    switch (e.data.action) {
        case 'addPoints':
            workerPoints += e.data.value;
            postMessage({ action: 'updatePoints', points: workerPoints });
            checkLevelUp();
            break;
        // Otros casos...
    }
};


function checkLevelUp() {
    if (workerPoints >= 10 * level) { // Asegúrate de tener acceso al nivel
        level++;
        postMessage({ action: 'levelUp', level });
    }
}
