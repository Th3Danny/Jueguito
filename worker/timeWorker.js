let startTime = 0;
let elapsedTime = 0;

self.onmessage = function (e) {
    if (e.data === 'start') {
        startTime = Date.now();
        setInterval(() => {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            self.postMessage(elapsedTime);  
        }, 1000);
    }
};
