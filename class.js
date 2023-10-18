class Bullet {
    constructor(vel = 1, position = {x : 0, y : 0}, aim = {x : 0, y : 0}, lifespan = 1, owner = 1){
        this.position = {
            x : position.x,
            y : position.y
        }

        let trueAim = {x : aim.x - fov.width/2, y : aim.y - fov.height/2};
        let velocityFactor = vel / Math.sqrt(Math.pow(trueAim.x, 2) + Math.pow(trueAim.y, 2));
        this.velocity = {
            x : trueAim.x * velocityFactor,
            y : trueAim.y * velocityFactor,
        }

        this.lifespan = lifespan;
        this.hasBouncedFrom = [];
        this.ownedBy = owner;
    }
}