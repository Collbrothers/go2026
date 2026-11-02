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
    }

    loadImage(imageSource) {
        this.image = new Image();
        this.image.src = imageSource;
    }

    update() {}

    draw() {}
}