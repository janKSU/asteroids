export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(b) {
        this.x = this.x + b.x;
        this.y = this.y + b.y;
    }

    subtract(b) {
        this.x = this.x - b.x;
        this.y = this.y - b.y;
    }

    dotProduct(b) {
        return this.x * b.x + this.y * b.y;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let mag = this.magnitude();
        return {
            x: this.x / mag,
            y: this.y / mag
        }
    }

    rotate(angle) {
        this.x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        this.y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    }

    perpendicular() {
        return {
            x: -this.y,
            y: this.x
        }
    }
}

