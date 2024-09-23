export class Car {
    constructor(x, y, speed, imageSrc) {
        this.x = x;
        this.y = y;
        this.speed = speed;

        
        this.carImage = new Image();
this.carImage.src = imageSrc;


      
        this.width = 70;
        this.height = 50; 
    }

    draw(ctx) {
        
        if (this.carImage.complete && this.carImage.naturalHeight !== 0) {
            ctx.drawImage(this.carImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
    }
}
