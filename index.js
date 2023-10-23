console.log("First Line Executed!");

//constants
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

const fpsDisplay = document.querySelector("#fps");

const BULLET_WIDTH = 7;
const WALL_WIDTH = 12;
const TOWER_WIDTH = 12;
const PLAYER_WIDTH = 10;
const GRID_WIDTH = 50;
const UNIT_WIDTH = GRID_WIDTH / 2;

const defuseCopter = {
  basic: {
    copterSpeed: 260,
    bulletSpeed: 260,
    bulletLifespan: 1.7,
    reloadTime: 0.75,
    inaccuracy: 0,
    bulletCount: 1,
  },
  drone: {
    copterSpeed: 230,
    bulletSpeed: 300,
    bulletLifespan: 1.5,
    reloadTime: 0.5,
    inaccuracy: 0.06,
    bulletCount: 1,
  },
  shotgun: {
    copterSpeed: 230,
    bulletSpeed: 260,
    bulletLifespan: 1.1,
    reloadTime: 1,
    inaccuracy: 0.03,
    bulletCount: 5,
  },
  minisnipe: {
    copterSpeed: 210,
    bulletSpeed: 320,
    bulletLifespan: 2,
    reloadTime: 0.75,
    inaccuracy: 0.03,
    bulletCount: 1,
  },
  machinegun: {
    copterSpeed: 175,
    bulletSpeed: 260, //!
    bulletLifespan: 1.25,
    reloadTime: 0.2,
    inaccuracy: 0.08,
    bulletCount: 1,
  },
  sniper: {
    copterSpeed: 180,
    bulletSpeed: 525,
    bulletLifespan: 2.4,
    reloadTime: 2,
    inaccuracy: 0.004,
    bulletCount: 1,
  },
};

const colors = {
  1: "rgb(77,77,77)",
  2: "rgb(61,93,255)",
  3: "rgb(253,53,53)",
  4: "rgb(0,128,55)",
  5: "rgb(255,128,42)",
  6: "rgb(146,75,255)",
  7: "rgb(85,213,255)",
  8: "rgb(24,226,31)",
  9: "rgb(246,89,255)",
  10: "rgb(247,255,42)",
  11: "rgb(255,95,174)",
  12: "rgb(147,254,0)",
  13: "rgb(0,255,188)",
  14: "rgb(0,0,0)",
  b1: "rgb(38,38,38)",
  b2: "rgb(31,47,178)",
  b3: "rgb(177,27,27)",
  b4: "rgb(0,64,27)",
  b5: "rgb(178,64,21)",
  b6: "rgb(73,38,128)",
  b7: "rgb(43,107,178)",
  b8: "rgb(12,113,36)",
  b9: "rgb(123,45,178)",
  b10: "rgb(124,178,21)",
  b11: "rgb(178,48,87)",
  b12: "rgb(74,127,0)",
  b13: "rgb(0,178,94)",
  b14: "rgb(0,0,0)",
};

//global variables
let gameClock = 0; //total playtime in ms

let delta = 0;

const player = {
  position: {
    x: 500,
    y: 300,
  },
  aimingAt: {
    x: 0,
    y: 0,
  },
  movement: {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  },
  money: 1000,
  score: 0,
  shooting: false,
  wantsToBuild: false,
  shootingCooldown: 0,
  copter: "basic",
};
const fov = {
  width: 0,
  height: 0,
};

const mapData = {
  width: 1000,
  height: 1000,
  towers: [
    { x: 0, y: 0, t: 1 },
    { x: 30, y: 10, t: 1 },
    { x: 800, y: 200, t: 1 },
    { x: 445, y: 943, t: 1 },
    { x: 700, y: 50, t: 1 },
    { x: 200, y: 10, t: 1 },
    { x: 800, y: 800, t: 1 },
  ],
  walls: [
    [3, 4],
    [2, 4],
    [5, 6],
  ],
  areas: [],
  bombs: [
    { type: "a", x: 100, y: 100 },
    { type: "b", x: 400, y: 500 },
  ],
  spawns: [
    { team: "red", x: 400, y: 20 },
    { team: "blue", x: 100, y: 300 },
  ],
};
mapData.walls.forEach((wall) => {
  wall.push(mapData.towers[wall[0]].t);
});
const gameData = {
  player: [],
  bullets: [],
};

//images
const images = {
  bombs: {
    a: new Image(),
    b: new Image(),
  },
};
images.bombs.a.src = "images/defly-defuse-bombSpotA.png";
images.bombs.b.src = "images/defly-defuse-bombSpotB.png";

function setup() {
  updateFov();
  gameLoop();
}

//functions for html stuff & autside gameloop
function updateFov() {
  fov.width = window.innerWidth;
  fov.height = window.innerHeight;
  canvas.width = fov.width;
  canvas.height = fov.height;
}

//one liner
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

const randomFloat = (min, max) => Math.random() * (max - min) + min;

const relToPlayer = {
  x: (realPos) => realPos + fov.width / 2 - player.position.x,
  y: (realPos) => realPos + fov.height / 2 - player.position.y,
};

//game functions
function gameLoop() {
  window.requestAnimationFrame(gameLoop);
  delta = new Date().getTime() - delta;
  gameClock += delta;
  delta /= 1000; //ms -> s
  updatePlayer();
  updateBullets();
  updateOtherStuff();
  draw();
  delta = new Date().getTime();
}

//player functions/calculations
function updatePlayer() {
  updatePlayerPosition();
  checkShoot();
  checkBuild();
}

function updatePlayerPosition() {
  let xMov = player.movement.right - player.movement.left;
  let yMov = player.movement.down - player.movement.up;
  xMov *= yMov != 0 ? 0.71 : 1;
  yMov *= xMov != 0 ? 0.71 : 1;
  player.position.x += xMov * defuseCopter[player.copter].copterSpeed * delta;
  player.position.y += yMov * defuseCopter[player.copter].copterSpeed * delta;
  player.position.x =
    player.position.x < 0
      ? 0
      : player.position.x < mapData.width
      ? player.position.x
      : mapData.width;
  player.position.y =
    player.position.y < 0
      ? 0
      : player.position.y < mapData.height
      ? player.position.y
      : mapData.height;
}

function checkShoot() {
  if (player.shootingCooldown > 0) player.shootingCooldown -= delta;
  if (player.shooting && player.shootingCooldown <= 0) {
    //spawn a bullet
    createBullets(
      player.position,
      player.aimingAt,
      defuseCopter[player.copter].inaccuracy,
      defuseCopter[player.copter].bulletSpeed,
      defuseCopter[player.copter].bulletLifespan,
      defuseCopter[player.copter].bulletCount
    );
    //gameData.bullets.push({position : {x : player.position.x, y : player.position.y}, velocity : {x : -20, y : 10}, lifespawn : 5})
    player.shootingCooldown = defuseCopter[player.copter].reloadTime;
  }
}

function createBullets(
  position,
  aim,
  inaccuracy,
  bulletSpeed,
  bulletLifespan,
  bulletCount
) {
  for (let c = -((bulletCount - 1) / 2); c < (bulletCount - 1) / 2 + 1; c++) {
    let left = aim.x > fov.width / 2 ? 0 : Math.PI;
    let shootingAngle =
      Math.atan((aim.y - fov.height / 2) / (aim.x - fov.width / 2)) + left;
    shootingAngle +=
      randomFloat(-Math.PI * inaccuracy, Math.PI * inaccuracy) +
      inaccuracy * c * 2 * Math.PI;
    gameData.bullets.push(
      new Bullet(bulletSpeed, position, shootingAngle, bulletLifespan)
    );
  }
}

function checkBuild() {
  if (!player.wantsToBuild || player.shooting) return;
  //check if player too close to tower, wall
  player.wantsToBuild = false;
  let x = player.position.x;
  let y = player.position.y;
  let canBuildHere = true;
  mapData.towers.forEach((tower) => {
    if (calculateDistance(tower.x, tower.y, x, y) < 4 * TOWER_WIDTH)
      canBuildHere = false;
  });
  if (canBuildHere) {
    mapData.walls.forEach((wall) => {
      if (
        getDistanceToLine(
          mapData.towers[wall[0]].x,
          mapData.towers[wall[0]].y,
          mapData.towers[wall[1]].x,
          mapData.towers[wall[1]].y,
          x,
          y
        ) <
          WALL_WIDTH + 2 * BULLET_WIDTH &&
        wall[2] != 1
      )
        canBuildHere = false;
    });
  }
  if (canBuildHere) mapData.towers.push({ x: x, y: y, t: 2 });
}

function updateBullets() {
  let fadedBullets = [];
  gameData.bullets.forEach((bullet, bIndex) => {
    let priorBouncedWalls = [];

    bullet.position.x += bullet.velocity.x * delta;
    bullet.position.y += bullet.velocity.y * delta;
    //check for collisions with walls, players, towers

    //walls
    mapData.walls.forEach((wall) => {
      let xT1 = mapData.towers[wall[0]].x;
      let yT1 = mapData.towers[wall[0]].y;
      let xT2 = mapData.towers[wall[1]].x;
      let yT2 = mapData.towers[wall[1]].y;
      let bulletDistanceToWall = getDistanceToLine(
        xT1,
        yT1,
        xT2,
        yT2,
        bullet.position.x,
        bullet.position.y
      );
      if (bulletDistanceToWall * 2 <= WALL_WIDTH + BULLET_WIDTH) {
        if (
          !bullet.hasBouncedFrom.includes(
            `${wall.tag}|${gameClock - delta * 1000}`
          )
        ) {
          bullet.hasBouncedFrom.push(`${wall.tag}|${gameClock}`);
          bullet.velocity = bounceBullet(
            bullet.velocity,
            { x: xT1, y: yT1 },
            { x: xT2, y: yT2 }
          );
        }
      }
    });

    //towers
    let bAlive = true;
    mapData.towers.forEach((tower, index) => {
      let distanceToBullet = calculateDistance(
        tower.x,
        tower.y,
        bullet.position.x,
        bullet.position.y
      );
      if (distanceToBullet < BULLET_WIDTH + TOWER_WIDTH) {
        console.log("HIT!");
        if (tower.t != bullet.ownedBy && bAlive) {
          bAlive = false;
          bullet.lifespan = 0;
          if (tower.t != 1) mapData.towers.splice(index, 1); //only if not grey tower
        }
      }
    });

    bullet.lifespan -= delta;
    if (bullet.lifespan <= 0) fadedBullets.push(bIndex);
    bullet.hasBouncedFrom.forEach((wallTags, wallTagId) => {
      if (wallTags.split("|")[1] != gameClock) {
        priorBouncedWalls.push(wallTagId);
      }
    });
    priorBouncedWalls.forEach((id, counter) => {
      bullet.hasBouncedFrom.splice(id + counter, 1);
    });
  });
  fadedBullets.forEach((bulletIndex, counter) => {
    gameData.bullets.splice(bulletIndex - counter, 1);
  });
}

function bounceBullet(bulletVector, t1, t2) {
  let velo = Math.sqrt(
    Math.pow(bulletVector.x, 2) + Math.pow(bulletVector.y, 2)
  );
  let sign = bulletVector.x < 0 ? 0 : 1;
  let alpha = Math.atan((t2.y - t1.y) / (t2.x - t1.x));
  let beta = sign * Math.PI - Math.atan(bulletVector.y / bulletVector.x);
  let gamma = Math.PI - alpha - beta;
  let delta = Math.PI - beta - 2 * gamma;
  //ONLY BOUNCE ONCE EVERY 2 TICS <-- add this (edit: idk)
  return { x: Math.cos(delta) * velo, y: Math.sin(delta) * velo };
}

function bounceFromTower(bulletPos, bulletVect, towerPos) {
  return {
    position: { x: bulletPos.x, y: bulletPos.y },
    vect: { x: bulletVect.x, y: bulletVect.y },
  };
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getDistanceToLine(wall1X, wall1Y, wall2X, wall2Y, point3X, point3Y) {
  const dx1 = point3X - wall1X;
  const dy1 = point3Y - wall1Y;
  const dx2 = point3X - wall2X;
  const dy2 = point3Y - wall2Y;
  const dx12 = wall2X - wall1X;
  const dy12 = wall2Y - wall1Y;

  // Calculate squared distances
  const dist1Sq = dx1 * dx1 + dy1 * dy1;
  const dist2Sq = dx2 * dx2 + dy2 * dy2;
  const lineLengthSq = dx12 * dx12 + dy12 * dy12;

  // Calculate squared distance from point3 to line formed by point1 and point2
  const crossProduct = dx1 * dy12 - dx12 * dy1;
  const distToLineSq = (crossProduct * crossProduct) / lineLengthSq;

  // Check if point3 is between point1 and point2
  const dotProduct = dx1 * dx12 + dy1 * dy12;
  if (dotProduct >= 0 && dotProduct <= lineLengthSq) {
    // Calculate the distance from point3 to the line
    const distToLine = Math.sqrt(distToLineSq);
    return distToLine;
  }

  return Infinity; // Point is not near the line
} //thx to alex

//such as fps, igshop etc.
function updateOtherStuff() {
  //only update fps ~3x/s
  if (gameClock % 300 <= delta * 1000) {
    fpsDisplay.innerHTML = `fps: ${Math.floor(1 / delta)} spf: ${delta}`;
  }
}

//draw functions
function draw() {
  drawBackground(); //White Background + Grids
  drawObstacles(); //1. Bombs, 2. Spawns, 3. Walls, 4. Towers, 5. Bullets
  drawAnimations(); //For when towers & Players get destroyed + bullets fading out :P
  drawPlayers(); //Enemies & You
}

function drawBackground() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    relToPlayer.x(0),
    relToPlayer.y(0),
    mapData.width,
    mapData.height
  );
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let c = GRID_WIDTH; c < mapData.width; c += GRID_WIDTH) {
    ctx.moveTo(relToPlayer.x(c), relToPlayer.y(0));
    ctx.lineTo(relToPlayer.x(c), relToPlayer.y(mapData.height));
  }
  for (let c = GRID_WIDTH; c < mapData.height; c += GRID_WIDTH) {
    ctx.moveTo(relToPlayer.x(0), relToPlayer.y(c));
    ctx.lineTo(relToPlayer.x(mapData.width), relToPlayer.y(c));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawObstacles() {
  mapData.spawns.forEach((spawn) => {
    ctx.strokeStyle = spawn.team === "red" ? "red" : "blue";
    ctx.strokeRect(relToPlayer.x(spawn.x), relToPlayer.y(spawn.y), 225, 225);
  });

  mapData.bombs.forEach((bomb) => {
    let type = bomb.type === "a" ? "a" : "b";
    ctx.drawImage(
      images.bombs[type],
      relToPlayer.x(bomb.x - 150),
      relToPlayer.y(bomb.y - 150),
      300,
      300
    );
  });

  mapData.walls.forEach((tAr) => {
    let sX = mapData.towers[tAr[0]].x;
    let sY = mapData.towers[tAr[0]].y;
    let eX = mapData.towers[tAr[1]].x;
    let eY = mapData.towers[tAr[1]].y;
    ctx.strokeStyle = colors[`b${tAr[2]}`];
    ctx.lineWidth = WALL_WIDTH;
    ctx.beginPath();
    ctx.moveTo(relToPlayer.x(sX), relToPlayer.y(sY));
    ctx.lineTo(relToPlayer.x(eX), relToPlayer.y(eY));
    ctx.stroke();
    ctx.strokeStyle = colors[tAr[2]];
    ctx.lineWidth = WALL_WIDTH - 3;
    ctx.beginPath();
    ctx.moveTo(relToPlayer.x(sX), relToPlayer.y(sY));
    ctx.lineTo(relToPlayer.x(eX), relToPlayer.y(eY));
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 2;
  mapData.towers.forEach((tower) => {
    ctx.fillStyle = colors[tower.t];
    ctx.beginPath();
    ctx.arc(
      relToPlayer.x(tower.x),
      relToPlayer.y(tower.y),
      TOWER_WIDTH,
      2 * Math.PI,
      false
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      relToPlayer.x(tower.x),
      relToPlayer.y(tower.y),
      TOWER_WIDTH - 1,
      2 * Math.PI,
      false
    );
    ctx.stroke();
  });

  gameData.bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.fillStyle = colors[bullet.ownedBy];
    ctx.moveTo(
      relToPlayer.x(bullet.position.x),
      relToPlayer.y(bullet.position.y)
    );
    ctx.arc(
      relToPlayer.x(bullet.position.x),
      relToPlayer.y(bullet.position.y),
      BULLET_WIDTH,
      2 * Math.PI,
      false
    );
    ctx.fill();
  });
  //checking for mouse coords
  ctx.beginPath();
  ctx.strokeStyle = "rgba(80, 80, 80, 0.5)";
  ctx.lineWidth = 5;
  ctx.moveTo(fov.width / 2, fov.height / 2);
  ctx.lineTo(player.aimingAt.x, player.aimingAt.y);
  ctx.stroke();
}

function drawAnimations() {}

function drawPlayers() {
  /*ctx.startPath();
    ctx.goTo(relToPlayer(player.position.x), relToPlayer(player.position.y));*/
  ctx.clearRect(
    relToPlayer.x(player.position.x - 10),
    relToPlayer.y(player.position.y - 10),
    20,
    20
  );
}

function selectCopter(newCopter) {
  document
    .querySelector(`#select-${player.copter}`)
    .classList.remove("selected");
  player.copter = newCopter;
  document.querySelector(`#select-${player.copter}`).classList.add("selected");
}

function buildMap(mapFile = "", format = "defly") {
  console.log(mapFile);
  console.log(format);
  mapData.towers = [];
  mapData.walls = [];
  mapData.areas = [];
  mapData.bombs = [];
  //mapData.spawns = [];
  switch (format) {
    case "defly": {
      let newMapData = mapFile.split(/\s+/);
      newMapData.forEach((identifier, position) => {
        switch (identifier) {
          case "MAP_WIDTH": {
            mapData.width = newMapData[position + 1] * UNIT_WIDTH;
            break;
          }
          case "MAP_HEIGHT": {
            mapData.height = newMapData[position + 1] * UNIT_WIDTH;
            break;
          }
          case "d": {
            mapData.towers.push({
              x: Number(newMapData[position + 2]) * UNIT_WIDTH,
              y: Number(newMapData[position + 3]) * UNIT_WIDTH,
              t: isNaN(Number(newMapData[position + 4]))
                ? 1
                : newMapData[position + 4],
            });
            break;
          }
          case "l": {
            mapData.walls.push([
              Number(newMapData[position + 1]) - 1,
              Number(newMapData[position + 2]) - 1,
              Number(mapData.towers[newMapData[position + 1]].t),
            ]);
            break;
          }
          case "z": {
            break;
          }
          case "s": {
            let team = {
              id: Number(newMapData[position + 1]) - 1,
            };
            team.name = team.id > 0 ? "red" : "blue";
            mapData.spawns[team.id] = {
              team: team.name,
              x: Number(newMapData[position + 2]) * UNIT_WIDTH - UNIT_WIDTH / 2,
              y: Number(newMapData[position + 3]) * UNIT_WIDTH - UNIT_WIDTH / 2,
            };
            break;
          }
          case "t": {
            let type = {
              id: Number(newMapData[position + 1]),
            };
            type.type = type.id > 0 ? "b" : "a";
            mapData.bombs[type.id] = {
              type: type.type,
              x: Number(newMapData[position + 2]) * UNIT_WIDTH,
              y: Number(newMapData[position + 3]) * UNIT_WIDTH,
            };
            break;
          }
        }
      });
      break;
    }
    case 'compact':{
      let newMapData = mapFile.split("|");

      //map size
      let newMapSize = newMapData[0].split(",");
      mapData.width = Number(newMapSize[0]) > 0 ? Number(newMapSize[0]) * UNIT_WIDTH : mapData.width;
      mapData.height = Number(newMapSize[1]) > 0 ? Number(newMapSize[1]) * UNIT_WIDTH : mapData.height;

      //koth bounds
      //dont need em rn
      //kothBounds = newMapData[1].split(",").length < 4 ? [] : newMapData[1].split(",");

      //defuse bombs
      let bombData = newMapData[2].split(",");
      for (let c = 0; bombData.length > c; c += 2) {
        mapData.bombs[c / 2] = {
          type : c/2 == 0 ? 'a' : 'b',
          x : bombData[0 + c] * UNIT_WIDTH,
          y : bombData[1 + c] * UNIT_WIDTH,
        }
      }

      //defuse spawns
      let spawnData = newMapData[3].split(",");
      for (let c = 0; spawnData.length > c; c += 3) {
        mapData.spawns[c/3] = {
          team : c/3 == 0 ? 'red' : 'blue',
          x : spawnData[0 + c] * UNIT_WIDTH,
          y : spawnData[1 + c] * UNIT_WIDTH,
        }
        //rotation: spawnData[2 + c],
      }

      //towers (and walls)
      let towerData = newMapData[4].split(";");
      towerData.forEach((rawTower, index) => {
        let tower = rawTower.split(",");
        let tColor = tower[2] === "" ? 1 : tower[2];
        mapData.towers.push({
          t : tColor,
          x : tower[0] * UNIT_WIDTH,
          y : tower[1] * UNIT_WIDTH,
        })
        //walls
        for (let c = 3; c < tower.length; c++) {
          mapData.walls.push([index, Number(tower[c], tColor)]);
        }
      });

      //shading
      /*we can ignore that for now
      let shadingData = newMapData[5].split(";");
      shadingData.forEach((rawShading) => {
        let shading = rawShading.split(",");
        let ids = [];
        shading.forEach((tId) => {
          ids.push(Number(tId) + startingTowerID - 1);
        });
        shadedAreas.push(ids);
        buildShading(ids);
      });
      */
      break;
    }
  }
  //working here but nrn idk
  /*let newMapData = JSON.parse(mapFile);
  mapFile.width = newMapData.width;for different map formats later
  mapFile.height = newMapData.height;*/
}

setup();

function checkUrl() {
  let url = window.location.search;
  if (url != "") {
    //let subs = url.substring(15);0123456789
    let identifier = url.substring(1, 9);
    console.log(identifier);
    switch (identifier) {
      case "loadMap:": {
        let mapData = url.substring(9);
        buildMap(mapData, "compact");
        break;
      }
    }
  } else {
    console.log(`Url standard: ${url}`);
  }
}
