import './asteroids.css';
import Vector from './vector';
import Sound from './laser_gun.mp3'

//WORLD CONSTANTS
const WIDTH = 800;
const HEIGHT = 640;

//BULLET CONSTANTS
const bulletSpeed = 10;
const bulletRadius = 4;

//SHIP CONSTANTS
const shipBulletLimit = 5;
const shipRadius = 15;
let shipLives = 5;
const shipMaxSpeed = 5;
const shipBraking = 0.01;
const shipSpeeding = 0.2;
const shipRotating = 0.1;

//ASTEROIDS CONSTANTS
const asteroidValue = 10;
const asteroidRadiusRange = [10, 12, 15];
const asteroidSpeedRange = [0.5, 0.7, 0.8];

class Object {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

class Ship extends Object {

    constructor(x, y, r, orientVector, speedVector, lives) {
        super(x, y, r);
        this.bullets = [];
        this.lives = lives;
        this.score = 0;
        this.orientVector = orientVector;
        this.speedVector = speedVector;
    }

    shoot() {
        if (this.bullets.length > shipBulletLimit - 1) {
            //console.log('Ship cannot shoot more than ' + shipBulletLimit + ' bullets');
        } else {
            this.bullets.push(new Bullet(this.x + this.r, this.y + this.r, bulletRadius, new Vector(this.orientVector.x, this.orientVector.y)));
            audio.play();
        }

    }

    move(elapsedTime) {
        console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);
        console.log("speedVector: " + this.speedVector.x + ' ' + this.speedVector.y);
        //console.log("ship x: " + this.x + ' y: ' + this.y);
        this.speedVector.add(new Vector(-this.speedVector.x * shipBraking, -this.speedVector.y * shipBraking));
        if (currentInput.up && this.speedVector.magnitude() < shipMaxSpeed) {
            this.speedVector.add(new Vector(this.orientVector.x * shipSpeeding, this.orientVector.y * shipSpeeding));
        }
        /*if (currentInput.down && this.speedVector.magnitude() < shipMaxSpeed) {
            this.speedVector.subtract(new Vector(this.orientVector.x * shipSpeeding, this.orientVector.y * shipSpeeding));
        }*/
        if (currentInput.left) {
            this.orientVector.rotate(-shipRotating);
        }
        if (currentInput.right) {
            this.orientVector.rotate(shipRotating);
        }
        this.x += this.speedVector.x;
        this.y += this.speedVector.y;

        //Edge constrains
        if (this.x < -this.r) {
            this.x = WIDTH;
        } else if (this.x > WIDTH) {
            this.x = -this.r;
        }

        if (this.y < -this.r) {
            this.y = HEIGHT;
        } else if (this.y > HEIGHT) {
            this.y = -this.r;
        }
    }
}

class Bullet extends Object {

    constructor(x, y, r, orientVector) {
        super(x, y, r);
        this.orientVector = orientVector;
    }

    move(elapsedTime) {
        //console.log("bullet x: " + this.x + ' y: ' + this.y);
        //console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);

        this.x += this.orientVector.x * bulletSpeed;
        this.y += this.orientVector.y * bulletSpeed;
    }
}

class Asteroid extends Object {
    constructor(x, y, r) {
        super(x, y, r);
        this.value = asteroidValue;
        this.orientVector = new Vector(getRndInteger(-100, 100), getRndInteger(-100, 100)).normalize();
        this.speed = asteroidSpeedRange[getRndInteger(0, asteroidSpeedRange.length - 1)];
        //console.log(this.orientVector);
        //console.log(this.speed);
    }

    move(elapsedTime) {
        //console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);
        this.x += this.orientVector.x * this.speed;
        this.y += this.orientVector.y * this.speed;

        //Edge constrains
        if (this.x < -this.r) {
            this.x = WIDTH;
        } else if (this.x > WIDTH) {
            this.x = -this.r;
        }

        if (this.y < -this.r) {
            this.y = HEIGHT;
        } else if (this.y > HEIGHT) {
            this.y = -this.r;
        }
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//Double buffer
let canvasBuffer = document.createElement('canvas');
canvasBuffer.height = HEIGHT;
canvasBuffer.width = WIDTH;
let canvasctxBuffer = canvasBuffer.getContext('2d');

let canvas = document.createElement('canvas');
canvas.height = HEIGHT;
canvas.width = WIDTH;
let canvasctx = canvas.getContext('2d');
document.body.appendChild(canvas);


//Game content variables and init function to reset game
var currentInput = null;
var priorInput = null;
var start = null;
var gameOver = null;
var asteroids = [];
var TimeNewEnemy = null;
var ship = null;
var audio = new Audio(Sound);

function new_level(level_number) {
    for (let i = 0; i < 10 * 1.5 * level_number; i++) {
        let x = getRndInteger(0, WIDTH);
        let y = getRndInteger(0, HEIGHT);
        let size = asteroidRadiusRange[getRndInteger(0, asteroidRadiusRange.length - 1)];
        asteroids.push(new Asteroid(x, y, size));
    }
}

function init() {
    //Game content variables
    currentInput = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
    priorInput = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
    };
    start = null;
    gameOver = false;
    asteroids = [];
    TimeNewEnemy = 0;

    ship = new Ship(WIDTH / 2, HEIGHT / 2, shipRadius, new Vector(0, -1), new Vector(0, 0), shipLives);
}

init();
new_level(1);

function handleKeyDown(event) {
    switch (event.key) {
        case ' ':
            currentInput.space = true;
            break;
        case 'ArrowUp':
            currentInput.up = true;
            break;
        /*case 'ArrowDown':
            currentInput.down = true;
            break;*/
        case 'ArrowRight':
            currentInput.right = true;
            break;
        case 'ArrowLeft':
            currentInput.left = true;
            break;
        case 'r':
            if (gameOver) {
                gameOver = false;
                init();
                window.requestAnimationFrame(gameloop);
            }
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case ' ':
            currentInput.space = false;
            break;
        case 'ArrowUp':
            currentInput.up = false;
            break;
        /*case 'ArrowDown':
            currentInput.down = false;
            break;*/
        case 'ArrowRight':
            currentInput.right = false;
            break;
        case 'ArrowLeft':
            currentInput.left = false;
            break;
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

//detect colisions of bullet and object
function collision(o1, o2) {
    let dx = o1.x - o2.x;
    let dy = o1.y - o2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < o1.r + o2.r) {
        return true;
    } else{
        return false;
    }
}

//update game state
function update(elapsedTime) {

    ship.move(elapsedTime);

    if (currentInput.space && !priorInput.space) {
        ship.shoot();
    }


    //Moving with bullets from Ship
    ship.bullets.forEach(function (bullet, index) {
        bullet.move(elapsedTime);
        if (bullet.x < 0 || bullet.x > WIDTH || bullet.y < 0 || bullet.y > HEIGHT) {
            ship.bullets.splice(index, 1);
        }
    });


    //Asteroid movement
    asteroids.forEach(function (asteroid) {
        asteroid.move(elapsedTime);
    });

    //Detecting collisions between ship bullets and asteroids
    ship.bullets.forEach(function (bullet, indexBullet) {
        asteroids.forEach(function (asteroid, indexAsteroid) {
            if (collision(bullet, asteroid)) {
                ship.score += asteroid.value;
                ship.bullets.splice(indexBullet, 1);
                asteroids.splice(indexAsteroid, 1);
            }
        });
    });
    /*
                //Detecting collision between asteroids bullets and sprites
                asteroids.forEach(function (enemy) {
                    enemy.bullets.forEach(function (bullet, index) {
                        if (collision(bullet, ship)) {
                            ship.lives -= 1;
                            enemy.bullets.splice(index, 1);
                        }
                    });
                });

                //Detecting collision between free bullets and sprites
                freeBullets.forEach(function (bullet, index) {
                    if (collision(bullet, ship)) {
                        ship.lives -= 1;
                        freeBullets.splice(index, 1);
                    }
                });

                //Creating new asteroids
                if (TimeNewEnemy > createEnemy) {
                    asteroids.push(new Asteroid(getRndInteger(0, WIDTH - enemySize), 0 - enemySize));
                    TimeNewEnemy = 0;
                    createEnemy = getRndInteger(createEnemyTime[0], createEnemyTime[1]);
                } else {
                    TimeNewEnemy += elapsedTime;
                }*/

    //Checking for ship lives
    return ship.lives > 0;
}

//render the world
function render() {
    canvasctxBuffer.clearRect(0, 0, WIDTH, HEIGHT);
    canvasctxBuffer.fillStyle = '#FF0000';
    canvasctxBuffer.save();
    canvasctxBuffer.translate(ship.x + ship.r, ship.y + ship.r);
    canvasctxBuffer.rotate(Math.atan2(ship.orientVector.y, ship.orientVector.x));
    canvasctxBuffer.beginPath();
    canvasctxBuffer.arc(0, 0, ship.r, 0, 2 * Math.PI);
    canvasctxBuffer.fill();
    canvasctxBuffer.stroke();
    canvasctxBuffer.beginPath();
    canvasctxBuffer.moveTo(0, 0);
    canvasctxBuffer.lineWidth = 5;
    canvasctxBuffer.lineTo(11 * ship.r / 10, 0);
    canvasctxBuffer.stroke();
    canvasctxBuffer.translate(-(ship.x + ship.r), -(ship.y + ship.r));
    canvasctxBuffer.restore();


    ship.bullets.forEach(function (bullet) {
        canvasctxBuffer.fillStyle = '#6047FF';
        //canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        canvasctxBuffer.beginPath();
        canvasctxBuffer.arc(bullet.x, bullet.y, bullet.r, 0, 2 * Math.PI);
        canvasctxBuffer.fill();
        canvasctxBuffer.stroke();
    });

    asteroids.forEach(function (asteroid) {
        canvasctxBuffer.fillStyle = '#48FF00';
        canvasctxBuffer.beginPath();
        canvasctxBuffer.arc(asteroid.x, asteroid.y, asteroid.r, 0, 2 * Math.PI);
        canvasctxBuffer.fill();
        canvasctxBuffer.stroke()
    });

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Lives: " + ship.lives, WIDTH - 90, 25);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Score: " + ship.score, 5, 25);
}

//main game loop function
function gameloop(timestamp) {
    if (!start) {
        start = timestamp;
    }
    let elapsedTime = timestamp - start;
    start = timestamp;
    let res = update(elapsedTime);
    render(elapsedTime);

    // Double buffering
    canvasctx.fillStyle = '#FFFFFF';
    canvasctx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasctx.drawImage(canvasBuffer, 0, 0);

    priorInput = JSON.parse(JSON.stringify(currentInput));
    if (res) {
        window.requestAnimationFrame(gameloop);
    } else {
        gameOver = true;
        ship = null;
        canvasctx.fillStyle = '#000000';
        canvasctx.font = "40px Arial";
        canvasctx.fillText("Game Over", WIDTH / 2 - WIDTH / 7, HEIGHT / 2);
        canvasctx.fillText("Press 'r' for game restart", WIDTH / 2 - WIDTH / 4, HEIGHT / 2 + HEIGHT / 7);
    }
}

//Start the game loop
window.requestAnimationFrame(gameloop);

