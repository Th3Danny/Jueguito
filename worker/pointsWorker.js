let workerPoints = 0;
let level = 1;
let maxPoints = 0;

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

        case 'savePoints':
            postMessage({ action: 'pointsSaved', points: workerPoints }); // No se puede guardar en localStorage
            break;

        case 'setMaxPoints':
            maxPoints = e.data.maxPoints; // Establece el máximo de puntos recibido
            break;


        case 'checkMaxPoints':
            if (workerPoints > maxPoints) {
                maxPoints = workerPoints;
                postMessage({ action: 'updateMaxPoints', maxPoints }); // Enviar el nuevo máximo al hilo principal
            }
            break;
    }
};

function checkLevelUp() {
    if (workerPoints >= 10 * level) {
        level++;
        postMessage({ action: 'levelUp', level });
    }
}
