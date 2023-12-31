class Bullet {
    constructor(vel = 1, position = {x : 0, y : 0}, aimAngle = 0, lifespan = 1, owner = 2){
        this.position = {
            x : position.x,
            y : position.y
        }

        this.velocity = {
            x : Math.cos(aimAngle) * vel,
            y : Math.sin(aimAngle) * vel,
        }

        this.lifespan = lifespan;
        this.lastBounceDelta = 0;
        this.ownedBy = owner;
    }
}