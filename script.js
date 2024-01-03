const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
});
document.getElementById("playstation").appendChild(app.view);

const globalVariables = {
    hit: 0,
    shot: 0,
    score: 0,
    getScore: function() {
        return this.score / (Math.abs(this.shot / 2) || 1);
    },
    updateShot: function() {
        this.shot++;
        this.updateScore();
    },
    updateHit: function(hit) {
        this.hit++;
        document.getElementById("hit").innerHTML = this.hit;
        this.score += hit;
        this.updateScore();
    },
    updateScore: function() {
        if(score >= 1000000) {
            document.getElementById("score").style.color = "red";
            app.ticker.stop();
        }
        document.getElementById("score").innerHTML = this.getScore().toFixed(2);
    }
}

class Ship {
    constructor() {
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.sprite = this.direction > 0 ? PIXI.Sprite.from("assets/right-ship.png") : PIXI.Sprite.from("assets/left-ship.png");
        this.setShip();
        this.move();
    }

    setShip(){
        
        this.sprite.anchor.set(0.5);
        this.sprite.x = Math.random() * app.screen.width;
        this.sprite.y = Math.random() * app.screen.height / 4 + 10;
        this.sprite.scale.set(0.5 + Math.random() * 0.5);
        app.stage.addChild(this.sprite);
    }
    move() {
        app.ticker.add(() => {
            if(this.sprite.x > app.screen.width) {
                this.direction = -1;
                this.sprite.texture = PIXI.Texture.from("assets/left-ship.png");
            } else if(this.sprite.x < 0) {
                this.direction = 1;
                this.sprite.texture = PIXI.Texture.from("assets/right-ship.png");
            }
            const speed = 0.5 + (globalVariables.getScore()) / 1000000;
            this.sprite.x += speed * this.direction  ;
        });
    }

    destroy() {
        app.stage.removeChild(this.sprite);

        const gif = PIXI.Sprite.from("assets/explosion-ship.gif");
        gif.anchor.set(0.5);
        gif.x = this.sprite.x;
        gif.y = this.sprite.y;
        gif.scale.set(0.5);
        app.stage.addChild(gif);
        setTimeout(() => {
            app.stage.removeChild(gif);
        }, 1000);

        // create new ship
        this.setShip();
    }
}

let ships = [];
for(let i = 0; i < 3; i++) {
    ships.push(new Ship());
}

class Canon {
    constructor(x) {
        this.sprite = PIXI.Sprite.from("assets/canon.png");
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = app.screen.height - app.screen.height /20;
        this.sprite.scale.set(0.5);
        app.stage.addChild(this.sprite);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('click', ()=>{this.onFire();});
    }

    onFire() {
        new Bomb(this.sprite.x, this.sprite.y);
        this.sprite.tint = 0xff0000;
        const gif = PIXI.Sprite.from("assets/canon-fire.gif");
        gif.anchor.set(0.5);
        gif.x = this.sprite.x;
        gif.y = this.sprite.y - this.sprite.height / 2 - 20;
        gif.scale.set(0.5);
        app.stage.addChild(gif);

         
        setTimeout(() => {
            this.sprite.tint = 0xffffff;
            app.stage.removeChild(gif);
        }, 1000);
    }
}

class Bomb {
    constructor(x, y) {
        this.sprite = PIXI.Sprite.from("assets/ball.png");
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.scale.set(0.5);
        app.stage.addChild(this.sprite);
        this.fire();
    }

    fire() {
        globalVariables.updateShot();

        const fireSound = new Audio('assets/fire.mp3');
        fireSound.play();

        app.ticker.add((delta) => {
            if(this.sprite.y < 0) {
                this.destroy();
            }
            for(let ship of ships) {
                if(Math.abs(this.sprite.x - ship.sprite.x) < 50 && Math.abs(this.sprite.y - ship.sprite.y) < 50) {
                    this.hit(ship);
                    const shipSize = ship.sprite.width * ship.sprite.height;
                    const shipWorth = (100000 - shipSize) / 100;
                    globalVariables.updateHit(shipWorth);
                }
            }
            this.sprite.y -= delta * 5;
        });
    }

    hit(ship) {
        const hitSound = new Audio('assets/hit.mp3');
        hitSound.play();
        ship.destroy();
    }

    destroy() {
        app.stage.removeChild(this.sprite);
        delete this;
    }
}

for(let i = 0; i < 5; i++) {
    new Canon(app.screen.width / 5 * (i + 0.5));
}