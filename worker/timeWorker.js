let startTime = 0;
let timerInterval;

onmessage = function (e) {
    if (e.data === 'start') {
        console.log('Temporizador iniciado en el Worker');
        clearInterval(timerInterval);
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            postMessage({ action: 'updateTime', elapsedTime });
        }, 1000);
    } else if (e.data === 'stop') {
        console.log('Temporizador detenido en el Worker');
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

