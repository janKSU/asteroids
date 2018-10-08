import './asteroids.css';
import Vector from './vector';
import laserGun from './laser_gun.wav'
import shipExplode from './ship_explode.wav'
import asteroidBump from './asteroid_bump.wav'

//WORLD CONSTANTS
const WIDTH = 1000;
const HEIGHT = 800;

//BULLET CONSTANTS
const bulletSpeed = 10;
const bulletRadius = 4;

//SHIP CONSTANTS
const shipBulletLimit = 5;
const shipRadius = 15;
let shipLives = 3;
const shipMaxSpeed = 5;
const shipBraking = 0.01;
const shipSpeeding = 0.2;
const shipRotating = 0.07;

//ASTEROIDS CONSTANTS
const asteroidValue = 100;
const asteroidRadius = 30;
const asteroidSpeed = 0.7;
var basicAmount = 5;

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
        this.lifeCooldown = 0;
    }

    shoot() {
        if (this.bullets.length > shipBulletLimit - 1) {
            //console.log('Ship cannot shoot more than ' + shipBulletLimit + ' bullets');
        } else {
            this.bullets.push(new Bullet(this.x, this.y, bulletRadius, new Vector(this.orientVector.x, this.orientVector.y)));
            //console.log('bullet shot');
            audioLaserQueue.pop().play();
            audioLaserQueue.push(new Audio(laserGun));
        }

    }

    move(elapsedTime) {
        //console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);
        //console.log("speedVector: " + this.speedVector.x + ' ' + this.speedVector.y);
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
        if (this.x < 0) {
            this.x = WIDTH;
        } else if (this.x > WIDTH) {
            this.x = 0;
        }

        if (this.y < 0) {
            this.y = HEIGHT;
        } else if (this.y > HEIGHT) {
            this.y = 0;
        }
    }

    restart_position() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        this.orientVector = new Vector(0, -1);
        this.speedVector = new Vector(0, 0);
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
    constructor(x, y, r, orientVector) {
        super(x, y, r);
        this.value = asteroidValue;
        this.orientVector = orientVector;
        this.speed = asteroidSpeed + getRndInteger(0, levelNumber * 0.1);
        //console.log(this.orientVector);
        //console.log(this.speed);
    }

    move(elapsedTime) {
        //console.log("orientVector: " + this.orientVector.x + ' ' + this.orientVector.y);
        this.x += this.orientVector.x * this.speed;
        this.y += this.orientVector.y * this.speed;

        let prev_x = 0;
        let prev_y = 0;

        //Edge constrains
        let edgeMove = false;
        if (this.x < 0) {
            prev_x = this.x;
            this.x = WIDTH;
            edgeMove = true;
        } else if (this.x > WIDTH) {
            prev_x = this.x;
            this.x = 0;
            edgeMove = true;
        }

        if (this.y < 0) {
            prev_y = this.y;
            this.y = HEIGHT;
            edgeMove = true;
        } else if (this.y > HEIGHT) {
            prev_y = this.y;
            this.y = 0;
            edgeMove = true;
        }

        if (edgeMove) {
            let aster = this;
            asteroids.forEach(function (asteroid) {
                if (collision(aster, asteroid) && aster !== asteroid) {
                    bounce(aster, asteroid);
                    aster.x = prev_x;
                    aster.y = prev_y;
                    //console.log(aster);
                }
            });
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
var levelNumber = 1;
var newLevelCountdown = 0;
var audioExplode = null;
var audioBump = null;
var escKey = false;
var audioLaserQueue = [];
var warp = false;
var warpCooldown = 15000;

function new_level() {
    newLevelCountdown = 2000;
    ship.lifeCooldown = 2500;
    for (let i = 0; i < basicAmount; i++) {
        let x = getRndInteger(asteroidRadius, WIDTH - asteroidRadius);
        let y = getRndInteger(asteroidRadius, HEIGHT - asteroidRadius);
        let size = asteroidRadius - getRndInteger(1, levelNumber * 3);
        if (size < 1) {
            size = 1;
        }
        let asteroid = new Asteroid(x, y, size, new Vector(getRndInteger(-100, 100), getRndInteger(-100, 100)).normalize());

        if (collision(ship, asteroid)) {
            i--;
            continue;
        }
        let asteroidCollision = false;
        for (let j = 0; j < asteroids.length; j++) {
            if (collision(asteroid, asteroids[j])) {
                asteroidCollision = true;
                break;
            }
        }
        if (!asteroidCollision) {
            asteroids.push(asteroid);
        } else {
            i--;
        }
    }
    basicAmount = basicAmount + 2;
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

    audioExplode = new Audio(shipExplode);
    audioBump = new Audio(asteroidBump);
    audioLaserQueue.push(new Audio(laserGun));

    levelNumber = 1;
    basicAmount = 5;
    new_level();

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
        case 'Escape':
            if (escKey) {
                escKey = false;
            } else {
                escKey = true;
            }
        case 'w':
            if (warpCooldown <= 0) {
                warp = true;
            }
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

//detect colisions of bullet and object
function collision(o1, o2) {
    let dx = o1.x - o2.x;
    let dy = o1.y - o2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    return distance < o1.r + o2.r;
}

//Asteroid bounce
function bounce(a1, a2) {
    /*let orientVector1 = new Vector(a1.orientVector.x, a1.orientVector.y);
    let orientVector2 = new Vector(a2.orientVector.x, a2.orientVector.y);
    let speed1 = a1.speed;
    let speed2 = a2.speed;

    a1.orientVector = orientVector2;
    a2.orientVector = orientVector1;
    a1.speed = speed2;
    a2.speed = speed1;

    a1.x += a1.orientVector.x * a1.speed * 1.5;
    a1.y += a1.orientVector.y * a1.speed * 1.5;
    a2.x += a2.orientVector.x * a2.speed * 1.5;
    a2.y += a2.orientVector.y * a2.speed * 1.5;*/

    let un = new Vector(a2.x - a1.x, a2.y - a1.y);
    un = un.normalize();
    let ut = new Vector(-un.y, un.x);
    ut = ut.normalize();

    let v1 = new Vector(a1.orientVector.x * a1.speed, a1.orientVector.y * a1.speed);
    let v2 = new Vector(a2.orientVector.x * a2.speed, a2.orientVector.y * a2.speed);

    let v1n = un.dotProduct(v1);
    let v1t = ut.dotProduct(v1);
    let v2n = un.dotProduct(v2);
    let v2t = ut.dotProduct(v2);


    let v1tnew = v1t;
    let v2tnew = v2t;
    let v1nnew = (v1n * (a1.r - a2.r) + 2 * a2.r * v2n) / (a1.r + a2.r);
    let v2nnew = (v2n * (a2.r - a1.r) + 2 * a1.r * v1n) / (a1.r + a2.r);

    v1nnew = new Vector(v1nnew * un.x, v1nnew * un.y);
    v1tnew = new Vector(v1tnew * ut.x, v1tnew * ut.y);
    v2nnew = new Vector(v2nnew * un.x, v2nnew * un.y);
    v2tnew = new Vector(v2tnew * ut.x, v2tnew * ut.y);


    let v1new = new Vector(v1nnew.x + v1tnew.x, v1nnew.y + v1tnew.y);
    let v2new = new Vector(v2nnew.x + v2tnew.x, v2nnew.y + v2tnew.y);

    a1.speed = v1new.magnitude();
    a2.speed = v2new.magnitude();
    a1.orientVector = v1new.normalize();
    a2.orientVector = v2new.normalize();

    a1.x += a1.orientVector.x * a1.speed * 1.5;
    a1.y += a1.orientVector.y * a1.speed * 1.5;
    a2.x += a2.orientVector.x * a2.speed * 1.5;
    a2.y += a2.orientVector.y * a2.speed * 1.5;

}

//Warp ship to random position
function warpShip() {
    let x = getRndInteger(shipRadius, WIDTH - shipRadius);
    let y = getRndInteger(shipRadius, HEIGHT - shipRadius);

    ship.x = x;
    ship.y = y;
    ship.lifeCooldown = 2500;
}

//update game state
function update(elapsedTime) {
    //If new level starts
    if (newLevelCountdown < 0) {

        ship.move(elapsedTime);

        if (currentInput.space && !priorInput.space) {
            ship.shoot();
        }

        //If the ship has just lost live so no collision
        if (ship.lifeCooldown < 0) {
            //Asteroid collision with ship
            asteroids.forEach(function (asteroid) {
                if (collision(asteroid, ship)) {
                    audioExplode.play();
                    ship.lives -= 1;
                    ship.lifeCooldown = 3000;
                    //asteroids.splice(indexAsteroid, 1);
                    ship.restart_position();
                }
            });
        } else {
            ship.lifeCooldown = ship.lifeCooldown - elapsedTime;
        }


        //Moving with bullets from Ship
        ship.bullets.forEach(function (bullet, index) {
            bullet.move(elapsedTime);
            if (bullet.x < 0 || bullet.x > WIDTH || bullet.y < 0 || bullet.y > HEIGHT) {
                ship.bullets.splice(index, 1);
            }
        });
        //Asteroids collision detection with other asteroids
        asteroids.forEach(function (a1) {
            /*if (a1.x === NaN || a1.y === NaN) {
                asteroids.splice(a1, 1);
            }*/

            a1.move(elapsedTime);
            asteroids.forEach(function (a2) {
                if (collision(a1, a2) && a1 !== a2) {
                    audioBump.play();
                    bounce(a1, a2);
                }
            });
        });

        //Detecting collisions between ship bullets and asteroids
        ship.bullets.forEach(function (bullet, indexBullet) {
            asteroids.forEach(function (asteroid, indexAsteroid) {

                if (bullet != null) {
                    if (collision(bullet, asteroid)) {
                        ship.bullets.splice(indexBullet, 1);
                        ship.score += asteroid.value;
                        asteroids.splice(indexAsteroid, 1);
                        if (asteroid.r / 2 >= asteroidRadius / levelNumber) {
                            let orientVector1 = new Vector(asteroid.orientVector.x, asteroid.orientVector.y);
                            orientVector1.rotate(1.5);
                            let newAsteroid1 = new Asteroid(asteroid.x + asteroid.r / 2 * orientVector1.x, asteroid.y + +asteroid.r / 2 * orientVector1.y, asteroid.r / 2, orientVector1);
                            newAsteroid1.move();
                            asteroids.push(newAsteroid1);
                            //console.log('asteroid');
                            let orientVector2 = new Vector(asteroid.orientVector.x, asteroid.orientVector.y);
                            orientVector2.rotate(-1.5);
                            let newAsteroid2 = new Asteroid(asteroid.x + asteroid.r / 2 * orientVector2.x, asteroid.y + +asteroid.r / 2 * orientVector2.y, asteroid.r / 2, orientVector2);
                            newAsteroid2.move();
                            asteroids.push(newAsteroid2);
                            //console.log('asteroid');
                        }
                        bullet = null;
                    }
                }
            });
        });
        //console.log(levelNumber);

        if (warp) {
            warpShip();
            warp = false;
            warpCooldown = 15000;
        } else {
            warpCooldown = Math.floor(warpCooldown - elapsedTime);
            if (warpCooldown < 0){
                warpCooldown = 0;
            }
        }

        //If the ship has destroyed all asteroids
        if (asteroids.length === 0 && ship.lives !== 0) {
            levelNumber++;
            ship.restart_position();
            ship.bullets = [];
            new_level();
        }
    } else {
        newLevelCountdown = newLevelCountdown - elapsedTime;
    }
}

//render the world
function render() {

    canvasctxBuffer.clearRect(0, 0, WIDTH, HEIGHT);
    canvasctxBuffer.fillStyle = '#000000';
    canvasctxBuffer.fillRect(0, 0, WIDTH, HEIGHT);

    //Change color for restart
    if (ship.lifeCooldown <= 0) {
        canvasctxBuffer.fillStyle = '#FF0000';
    } else {
        canvasctxBuffer.fillStyle = '#ff8b8e';
    }

    canvasctxBuffer.save();
    canvasctxBuffer.translate(ship.x, ship.y);
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
    canvasctxBuffer.translate(-(ship.x), -(ship.y));
    canvasctxBuffer.restore();


    ship.bullets.forEach(function (bullet) {
        canvasctxBuffer.fillStyle = '#6047FF';
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
    canvasctxBuffer.fillStyle = "#FFFFFF";
    canvasctxBuffer.fillText("Level: " + levelNumber, 5, 25);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#FFFFFF";
    canvasctxBuffer.fillText("Score: " + ship.score, WIDTH/2 - 250, 25);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#FFFFFF";
    canvasctxBuffer.fillText("Warp cooldown: " + warpCooldown, WIDTH / 2 + 10, 25);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#FFFFFF";
    canvasctxBuffer.fillText("Lives: " + ship.lives, WIDTH - 90, 25);



    //Draw countdown into front of the screen
    if (ship.lifeCooldown > 0 && ship.lives > 0) {
        canvasctxBuffer.font = "30px Arial";
        canvasctxBuffer.fillStyle = "#FFFFFF";
        canvasctxBuffer.fillText("Shield: " + Math.floor(ship.lifeCooldown), WIDTH / 2 - 90, HEIGHT / 2 - 100);
    }
    if (newLevelCountdown > 0) {
        canvasctxBuffer.font = "70px Arial";
        canvasctxBuffer.fillStyle = "#000000";
        canvasctxBuffer.fillRect(0, 0, WIDTH, HEIGHT);
        canvasctxBuffer.fillStyle = "#FFFFFF";
        canvasctxBuffer.fillText("Level " + levelNumber, WIDTH / 2 - 100, HEIGHT / 2);
        //canvasctxBuffer.fillText("Starts in " + Math.floor(newLevelCountdown), WIDTH / 2 - 150, HEIGHT / 2);
    }
}

//main game loop function
function gameloop(timestamp) {
    if (!start) {
        start = timestamp;
    }
    let elapsedTime = timestamp - start;
    start = timestamp;

    //If not pause, update and render
    if (!escKey) {
        update(elapsedTime);
        render(elapsedTime);


        // Double buffering
        canvasctx.fillStyle = '#FFFFFF';
        canvasctx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasctx.drawImage(canvasBuffer, 0, 0);
    } else {
        canvasctx.fillStyle = '#0e0089';
        canvasctx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasctx.fillStyle = '#FFFFFF';
        canvasctx.font = "40px Arial";

        canvasctx.fillText("Game paused", WIDTH / 2 - 120, 50);
        canvasctx.font = "30px Arial";

        canvasctx.fillText("UP : Accelerate", 50, 100);
        canvasctx.fillText("LEFT : Turn left", 50, 150);
        canvasctx.fillText("RIGHT : Turn right", 50, 200);
        canvasctx.fillText("SPACEBAR : Shoot ", 50, 250);
        canvasctx.fillText("ESCAPE : Pause/Unpause game ", 50, 300);
        canvasctx.fillText("W : Ship will be warped to random location.", 50, 350);


    }


    priorInput = JSON.parse(JSON.stringify(currentInput));
    if (ship.lives > 0) {
        window.requestAnimationFrame(gameloop);
    } else {
        gameOver = true;
        ship = null;
        canvasctx.fillStyle = '#FFFFFF';
        canvasctx.font = "50px Arial";
        canvasctx.fillText("Game Over", WIDTH / 2 - 120, HEIGHT / 2);
        canvasctx.fillText("Press 'r' for game restart", WIDTH / 2 - 250, HEIGHT / 2 + 70);
    }
}

//Start the game loop
window.requestAnimationFrame(gameloop);

