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

class DynamicObject extends GameObject {
    constructor (x,y,width,height,image){
        super(x,y,width,height,image)
    }
}

class StaticObject extends GameObject{
    constructor (x,y,width,height,image){
        super(x,y,width,height,image)
    }
}