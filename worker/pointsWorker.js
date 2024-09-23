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
            workerPoints = 0; 
            level = 1; 
            postMessage({ action: 'updatePoints', points: workerPoints });
            break;

        case 'savePoints':
            postMessage({ action: 'pointsSaved', points: workerPoints }); 
            break;

        case 'setMaxPoints':
            maxPoints = e.data.maxPoints; 
            break;


        case 'checkMaxPoints':
            if (workerPoints > maxPoints) {
                maxPoints = workerPoints;
                postMessage({ action: 'updateMaxPoints', maxPoints });
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
