import './asteroids.css';
import Vector from './vector';
import Sound from './laser_gun.mp3'

//WORLD CONSTANTS
const WIDTH = 800;
const HEIGHT = 640;

//BULLET CONSTANTS
const bulletSpeed = 8;
const bulletSize = 8;

//SHIP CONSTANTS
const shipBulletLimit = 50;
const shipSize = 25;
let shipLives = 5;
const shipMaxSpeed = 0.4;
const shipBraking = 0.004;
const shipSpeeding = 0.01;
const shipRotating = 0.03;

//ASTEROIDS CONSTANTS
const asteroidValue = 10;
const asteroidSizeRange = [10, 25];

class Object {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Ship extends Object {

    constructor(x, y, w, h, orientVector, speedVector, lives) {
        super(x, y, w, h);
        this.bullets = [];
        this.lives = lives;
        this.score = 0;
        this.orientVector = orientVector;
        this.speedVector = speedVector;
    }

    shoot() {
        if (this.bullets.length > shipBulletLimit - 1) {
            console.log('Ship cannot shoot more than ' + shipBulletLimit + ' bullets');
        } else {
            audio.play();
            this.bullets.push(new Bullet(this.x + this.w / 2, this.y + this.h / 2, bulletSize, bulletSize, new Vector(this.orientVector.x, this.orientVector.y)));
        }

    }

    move(elapsedTime) {
        //console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);
        //console.log("speedVector: " + this.speedVector.x + ' ' + this.speedVector.y);
        //console.log("ship x: " + this.x + ' y: ' + this.y);
        this.speedVector.add(new Vector(-this.speedVector.x*shipBraking, -this.speedVector.y*shipBraking));
        if (currentInput.up && this.speedVector.magnitude() < shipMaxSpeed) {
            this.speedVector.add(new Vector(this.orientVector.x * shipSpeeding, this.orientVector.y * shipSpeeding));
        }
        if (currentInput.down && this.speedVector.magnitude() < shipMaxSpeed) {
            this.speedVector.subtract(new Vector(this.orientVector.x * shipSpeeding, this.orientVector.y * shipSpeeding));
        }
        if (currentInput.left) {
            this.orientVector.rotate(-shipRotating);
        }
        if (currentInput.right) {
            this.orientVector.rotate(shipRotating);
        }
        ship.x += this.speedVector.x * elapsedTime;
        ship.y += this.speedVector.y * elapsedTime;
        if (ship.x < -ship.w * 1.45) {
            ship.x = WIDTH;
        } else if (ship.x > WIDTH) {
            ship.x = -ship.w;
        }

        if (ship.y < -ship.h * 1.45) {
            ship.y = HEIGHT;
        } else if (ship.y > HEIGHT) {
            ship.y = -ship.h * 1.45;
        }
    }
}

class Bullet extends Object {

    constructor(x, y, w, h, orientVector) {
        super(x, y, w, h);
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
    constructor(x, y, w, h, vector) {
        super(x, y, w, h, vector);
    }

    move() {

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
var enemies = null;
var TimeNewEnemy = null;
var ship = null;
var audio = new Audio(Sound);

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
    enemies = [];
    TimeNewEnemy = 0;

    ship = new Ship(WIDTH / 2, HEIGHT / 2, shipSize, shipSize, new Vector(0, -1), new Vector(0, 0), shipLives);
}

init();

function handleKeyDown(event) {
    switch (event.key) {
        case ' ':
            currentInput.space = true;
            break;
        case 'ArrowUp':
            currentInput.up = true;
            break;
        case 'ArrowDown':
            currentInput.down = true;
            break;
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
        case 'ArrowDown':
            currentInput.down = false;
            break;
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
function collision(object1, object2) {
    if (object1.x <= object2.x && object1.y <= object2.y && object1.x + object1.w >= object2.x && object1.y + object1.h >= object2.y) {
        return true;
    }
    if (object1.x <= object2.x && object1.y >= object2.y && object1.x + object1.w >= object2.x && object2.y + object2.h >= object1.y) {
        return true;
    }
    if (object1.x >= object2.x && object1.y <= object2.y && object2.x + object2.w >= object1.x && object1.y + object1.h >= object2.y) {
        return true;
    }
    return object1.x >= object2.x && object1.y >= object2.y && object2.x + object2.w >= object1.x && object2.y + object2.h >= object1.y;
}

//update game state
function update(elapsedTime) {

    ship.move(elapsedTime);

    if (currentInput.space && !priorInput.space) {
        ship.shoot();
    }


    //Moving with bullets from Ship
    ship.bullets.forEach(function (bullet, index) {
        bullet.move();
        if (bullet.x < 0 || bullet.x > WIDTH || bullet.y < 0 || bullet.y > HEIGHT) {
            ship.bullets.splice(index, 1);
        }
    });
    /*
        //Moving with bullets from Enemies
        enemies.forEach(function (enemy) {
            enemy.shoot(elapsedTime);
            enemy.bullets.forEach(function (bullet, index) {
                bullet.y += bulletSpeed * elapsedTime;
                if (bullet.y > HEIGHT) {
                    enemy.bullets.splice(index, 1);
                }
            });
        });

        //Moving with bullets that left from dead enemies
        freeBullets.forEach(function (bullet, index) {
            bullet.y += bulletSpeed * elapsedTime;
            if (bullet.y > HEIGHT) {
                freeBullets.splice(index, 1);
            }
        });

        //Enemies movement
        enemies.forEach(function (enemy, index) {
            enemy.rotation += enemy.rotationSpeed;
            if (enemy.rotationFunc === 1) {
                enemy.x = Math.sin(enemy.rotation) * enemy.min + enemy.max;
            } else {
                enemy.x = Math.cos(enemy.rotation) * enemy.min + enemy.max;
            }

            enemy.y += enemySpeed * elapsedTime;
            if (enemy.y + enemy.h > HEIGHT) {
                ship.lives -= 1;
                enemies.splice(index, 1);
            }
        });

        //Detecting collisions between ship bullets and enemies
        ship.bullets.forEach(function (bullet, indexBullet) {
            enemies.forEach(function (enemy, indexEnemy) {
                if (collision(bullet, enemy)) {
                    ship.score += enemy.value;
                    ship.bullets.splice(indexBullet, 1);
                    enemy.bullets.forEach(function (enemyBullet) {
                        freeBullets.push(enemyBullet);
                    });
                    enemies.splice(indexEnemy, 1);
                }
            });
        });

        //Detecting collision between enemies bullets and sprites
        enemies.forEach(function (enemy) {
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

        //Creating new enemies
        if (TimeNewEnemy > createEnemy) {
            enemies.push(new Asteroid(getRndInteger(0, WIDTH - enemySize), 0 - enemySize));
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
    canvasctxBuffer.translate(ship.x + ship.w / 2, ship.y + ship.h / 2);
    canvasctxBuffer.rotate(Math.atan(ship.orientVector.y / ship.orientVector.x));
    canvasctxBuffer.fillRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
    canvasctxBuffer.translate(-(ship.x + ship.w / 2), -(ship.y + ship.h / 2));
    canvasctxBuffer.restore();


    ship.bullets.forEach(function (bullet) {
        canvasctxBuffer.fillStyle = '#6047FF';
        canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    });
    /*
    enemies.forEach(function (enemy) {
        canvasctxBuffer.fillStyle = '#48FF00';
        canvasctxBuffer.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        enemy.bullets.forEach(function (bullet) {
            canvasctxBuffer.fillStyle = '#6047FF';
            canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        })
    });

    freeBullets.forEach(function (bullet) {
        canvasctxBuffer.fillStyle = '#6047FF';
        canvasctxBuffer.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    });*/

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

