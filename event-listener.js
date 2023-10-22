window.addEventListener("resize", (event) => {
    updateFov();
});

document.addEventListener('keydown', (event) => {
    switch(event.key.toLowerCase()){
        case 'w':
        case 'arrowup':{
            player.movement.up = 1;
            break;
        }
        case 'a':
        case 'arrowleft':{
            player.movement.left = 1;
            break;
        }
        case 's':
        case 'arrowdown':{
            player.movement.down = 1;
            break;
        }
        case 'd':
        case 'arrowright':{
            player.movement.right = 1;
            break;
        }
    }
})

document.addEventListener('keyup', (event) => {
    switch(event.key.toLowerCase()){
        case 'w':
        case 'arrowup':{
            player.movement.up = 0;
            break;
        }
        case 'a':
        case 'arrowleft':{
            player.movement.left = 0;
            break;
        }
        case 's':
        case 'arrowdown':{
            player.movement.down = 0;
            break;
        }
        case 'd':
        case 'arrowright':{
            player.movement.right = 0;
            break;
        }
    }
})

document.querySelector('#game-canvas').addEventListener('mousedown', (event) =>{
    if(event.button === 0){
        player.shooting = true;
        return;
    }
    if(event.button === 2){
        player.wantsToBuild = true;
    }
})
document.querySelector('#game-canvas').addEventListener('mouseup', (event) =>{
    player.shooting = event.button === 0 ? false : player.shooting;
    if(!player.shooting) player.wantsToBuild = false;
})
document.querySelector('#game-canvas').addEventListener('mousemove', (event) =>{
    player.aimingAt.x = event.clientX;
    player.aimingAt.y = event.clientY;
})

document.addEventListener('contextmenu', (e) => {e.preventDefault();})
/*







document.addEventListener('keydown', (event) => {
    if(event.key === 'q'){
        defly.selectSuperpower(5);
    }else if(event.key === 'r'){
        defly.respawn();
    }
})
*/