export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(b) {
        let orig_x=this.x;
        let orig_y=this.y;
        this.x = orig_x + b.x;
        this.y = orig_y + b.y;
    }

    subtract(b) {
        let orig_x=this.x;
        let orig_y=this.y;
        this.x = orig_x - b.x;
        this.y = orig_y - b.y;
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
        let orig_x=this.x;
        let orig_y=this.y;
        this.x = orig_x * Math.cos(angle) - orig_y * Math.sin(angle);
        this.y = orig_x * Math.sin(angle) + orig_y * Math.cos(angle);
    }

    perpendicular() {
        return {
            x: -this.y,
            y: this.x
        }
    }
}

