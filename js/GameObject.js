/**
 * @abstract
 */
class GameObject {
    x;
    y;
    image;

    constructor({x, y, width, height} = {}) {
        if (new.target === GameObject) {
            console.error("Inheritance of an abstract class")
        }
    }
}