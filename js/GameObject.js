/**
 * @abstract
 */
class GameObject {
    coordinate;
    image;

    constructor({coordinate, width, height} = {}) {
        if (new.target === GameObject) throw new Error("GameObject is abstract");
        this.coordinate = coordinate;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    collidesWith(obj) {
        const dx = obj.coordinate.x - this.coordinate.x;
        const dy = obj.coordinate.y - this.coordinate.y;
        return Math.hypot(dx, dy) < (this.width + obj.width) / 2;
    }

    loadImage(imageSource) {
        this.image = new Image();
        this.image.src = imageSource;
    }

    update() {}

    draw() {}
}