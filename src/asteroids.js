import './asteroids.css';
import Vector from './vector';
import laserGun from './laser_gun.mp3'
import shipExplode from './ship_explode.mp3'

//WORLD CONSTANTS
const WIDTH = 800;
const HEIGHT = 640;

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
const shipRotating = 0.1;

//ASTEROIDS CONSTANTS
const asteroidValue = 30;
const asteroidRadiusRange = [20];
const asteroidSpeedRange = [0.2, 1, 2];
const basicAmount = 20;
const levelMultipl = 1.1;

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
            //laserGunAudio.play();
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
        this.speed = asteroidSpeedRange[getRndInteger(0, asteroidSpeedRange.length - 1)];
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
                    console.log(aster);
                    return;
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
var laserGunAudio = new Audio(laserGun);
var laserShipExplode = new Audio(shipExplode);

function new_level() {
    newLevelCountdown = 3000;
    for (let i = 0; i < basicAmount * levelMultipl * levelNumber; i++) {
        let size = asteroidRadiusRange[getRndInteger(0, asteroidRadiusRange.length - 1)];
        let x = getRndInteger(size, WIDTH - size);
        let y = getRndInteger(size, HEIGHT - size);
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
    } else {
        return false;
    }
}

//Asteroid bounce
function bounce(a1, a2) {
    let orientVector1 = new Vector(a1.orientVector.x, a1.orientVector.y);
    let orientVector2 = new Vector(a2.orientVector.x, a2.orientVector.y);
    let speed1 = a1.speed;
    let speed2 = a2.speed;

    a1.orientVector = orientVector2;
    a2.orientVector = orientVector1;
    a1.speed = speed2;
    a2.speed = speed1;

    a1.x += a1.orientVector.x * a1.speed*1.5;
    a1.y += a1.orientVector.y * a1.speed*1.5;
    a2.x += a2.orientVector.x * a2.speed*1.5;
    a2.y += a2.orientVector.y * a2.speed*1.5;

    /*let theta1 = Math.atan2(a1.orientVector.x, a1.orientVector.y);
    let theta2 = Math.atan2(a2.orientVector.x, a2.orientVector.y);
    let phi = Math.atan2(a2.y - a1.y, a2.x - a1.x);
    let m1 = a1.r;
    let m2 = a2.r;
    let v1 = a1.speed;
    let v2 = a2.speed;

    let dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
    let dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
    let dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
    let dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);
    console.log(a1.orientVector);
    a1.orientVector = new Vector(dx1F, dy1F);
    a2.orientVector = new Vector(dx2F, dy2F);
    console.log(a1.orientVector);*/
}

//update game state
function update(elapsedTime) {
    //If new level starts
    if (newLevelCountdown < 0) {

        ship.move(elapsedTime);

        if (currentInput.space && !priorInput.space) {
            ship.shoot();
        }

        //If the ship has just lost lives
        if (ship.lifeCooldown < 0) {
            //Asteroid collision with ship
            asteroids.forEach(function (asteroid, indexAsteroid) {
                if (collision(asteroid, ship)) {
                    //laserShipExplode.play();
                    //ship.lives -= 1;
                    //ship.lifeCooldown = 3000;
                    //asteroids.splice(indexAsteroid, 1);
                    //ship.restart_position();
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
            a1.move(elapsedTime);
            asteroids.forEach(function (a2) {
                if (collision(a1, a2) && a1 != a2) {
                    bounce(a1, a2);
                }
            });
        });

        //Detecting collisions between ship bullets and asteroids
        ship.bullets.forEach(function (bullet, indexBullet) {
            asteroids.forEach(function (asteroid, indexAsteroid) {
                if (collision(bullet, asteroid)) {
                    ship.bullets.splice(indexBullet, 1);
                    ship.score += asteroid.value;
                    asteroids.splice(indexAsteroid, 1);
                    /*let orientVector = new Vector(asteroid.orientVector.x, asteroid.orientVector.y);
                    orientVector.rotate(0.3);
                    asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.r / 2, orientVector));
                    orientVector = new Vector(asteroid.orientVector.x, asteroid.orientVector.y);
                    orientVector.rotate(-0.3);
                    asteroids.push(new Asteroid(asteroid.x, asteroid.y, asteroid.r / 2, orientVector));*/
                }
            });
        });

        //If the ship has destroyed all asteroids
        if (asteroids.length == 0) {
            levelNumber++;
            ship.restart_position();
            new_level();
        }
    } else {
        newLevelCountdown = newLevelCountdown - elapsedTime;
    }
    //Checking for ship lives
    return ship.lives > 0;
}

//render the world
function render() {

    canvasctxBuffer.clearRect(0, 0, WIDTH, HEIGHT);

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
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Lives: " + ship.lives, WIDTH - 90, 25);

    canvasctxBuffer.font = "20px Arial";
    canvasctxBuffer.fillStyle = "#000000";
    canvasctxBuffer.fillText("Score: " + ship.score, 5, 25);

    //Draw countdown into front of the screen
    if (ship.lifeCooldown > 0 && ship.lives > 0) {
        canvasctxBuffer.font = "30px Arial";
        canvasctxBuffer.fillStyle = "#000000";
        canvasctxBuffer.fillText("Shield: " + Math.floor(ship.lifeCooldown), WIDTH / 2 - 100, HEIGHT / 2 - 100);
    }
    if (newLevelCountdown > 0) {
        canvasctxBuffer.font = "70px Arial";
        canvasctxBuffer.fillStyle = "#000000";
        canvasctxBuffer.fillText("Level " + levelNumber, WIDTH / 2 - 150, HEIGHT / 2 - 100);
        canvasctxBuffer.fillText("Starts in " + Math.floor(newLevelCountdown), WIDTH / 2 - 150, HEIGHT / 2);
    }
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

