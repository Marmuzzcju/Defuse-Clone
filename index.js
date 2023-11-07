console.log("First Line Executed!");

//constants
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

const fpsDisplay = document.querySelector("#fps");

const BULLET_WIDTH = 7;
const WALL_WIDTH = 13;
const TOWER_WIDTH = 13;
const PLAYER_WIDTH = 5;
const GRID_WIDTH = 44;
const UNIT_WIDTH = GRID_WIDTH / 2;

const MAX_DELTA = 0.1;

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
  weapon7: {
    copterSpeed: 180,
    bulletSpeed: 150,
    bulletLifespan: 10,
    reloadTime: 1.2,
    inaccuracy: 0,
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
  f1: "rgba(77,77,77,0.5)",
  f2: "rgba(61,93,255,0.5)",
  f3: "rgba(253,53,53,0.5)",
  f4: "rgba(0,128,55,0.5)",
  f5: "rgba(255,128,42,0.5)",
  f6: "rgba(146,75,255,0.5)",
  f7: "rgba(85,213,255,0.5)",
  f8: "rgba(24,226,31,0.5)",
  f9: "rgba(246,89,255,0.5)",
  f10: "rgba(247,255,42,0.5)",
  f11: "rgba(255,95,174,0.5)",
  f12: "rgba(147,254,0,0.5)",
  f13: "rgba(0,255,188,0.5)",
  f14: "rgba(0,0,0,0.5)",
};

//global variables
let gameClock = 0; //total playtime in ms

let delta = 0;
let localDelta = 0;

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
  isStuck: false,
  connectedTo: false,
  team: 2,
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

const permanentMapData = {
  width: 1000,
  height: 1000,
  towers: {
    1: [
      { x: 0, y: 0, t: 1 },
      { x: 30, y: 10, t: 1 },
      { x: 800, y: 200, t: 1 },
      { x: 445, y: 943, t: 1 },
      { x: 700, y: 50, t: 1 },
      { x: 200, y: 10, t: 1 },
      { x: 800, y: 800, t: 1 },
    ], //grey
    2: [], //blue
    3: [], //red
    4: [], //green
  },
  walls: {
    1: [
      [3, 4],
      [2, 4],
      [5, 6],
    ], //grey
    2: [], //blue
    3: [], //red
    4: [], //green
  },
  areas: {
    1: [], //grey
    2: [], //blue
    3: [], //red
    4: [], //green
  },
  bombs: [
    { type: "a", x: 100, y: 100 },
    { type: "b", x: 400, y: 500 },
  ],
  spawns: [
    { x: 400, y: 20 },
    { x: 100, y: 300 },
  ],
};
const mapData = {
  width: 1000,
  height: 1000,
  towers: [],
  walls: [],
  areas: [],
  bombs: [],
  spawns: [],
};

const gameData = {
  player: [],
  bullets: [],
};

let towerRegister = [];

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
  delta = new Date().getTime();
  gameLoop();
}

//functions for html stuff & outside gameloop
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
  let counter = 0;
  do {
    localDelta = delta > MAX_DELTA ? MAX_DELTA : delta;
    updatePlayer();
    updateBullets();
    updateOtherStuff();
    delta -= MAX_DELTA;
    counter++;
    if (counter > 1 && counter < 10)
      console.log(`Counter smh: ${counter} - Delta: ${delta}`);
  } while (delta > MAX_DELTA && counter < 100);
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
  if (typeof player.isStuck === "boolean") {
    let xMov = player.movement.right - player.movement.left;
    let yMov = player.movement.down - player.movement.up;
    xMov *= yMov != 0 ? 0.71 : 1;
    yMov *= xMov != 0 ? 0.71 : 1;
    player.position.x +=
      xMov * defuseCopter[player.copter].copterSpeed * localDelta;
    player.position.y +=
      yMov * defuseCopter[player.copter].copterSpeed * localDelta;
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
  } else {
    player.position.x +=
      Math.cos(player.isStuck) *
      defuseCopter[player.copter].copterSpeed *
      localDelta;
    player.position.y +=
      Math.sin(player.isStuck) *
      defuseCopter[player.copter].copterSpeed *
      localDelta;
  }
  mapData.towers[player.team].forEach((tower, index) => {
    if (
      calculateDistance(
        player.position.x,
        player.position.y,
        tower.x,
        tower.y
      ) <
      TOWER_WIDTH + PLAYER_WIDTH
    ) {
      player.connectedTo = index;
    }
  });
  checkPlayerWallCollision();
}
function checkPlayerWallCollision() {
  let wallBounceCounter = 0;
  player.isStuck = 0;
  Object.entries(mapData.walls).forEach((wallSet) => {
    if (wallSet[0] != player.team) {
      wallSet[1].forEach((wall) => {
        let distance = getDistanceToLine(
          mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].x,
          mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].y,
          mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].x,
          mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].y,
          player.position.x,
          player.position.y
        );
        if (distance < WALL_WIDTH + PLAYER_WIDTH) {
          //colliding
          if (wallSet[0] == 1) {
            //grey wall, bounce player
            wallBounceCounter++;
            player.isStuck += getBounceBulletAngle(
              {
                x: player.movement.right - player.movement.left,
                y: player.movement.down - player.movement.up,
              },
              {
                x: mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].x,
                y: mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].y,
              },
              {
                x: mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].x,
                y: mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].y,
              }
            );
          } else {
            //enemy wall, die
          }
        }
      });
    }
  });
  if (wallBounceCounter > 0) {
    player.isStuck /= wallBounceCounter;
  } else {
    player.isStuck = false;
  }
}

function checkShoot() {
  if (player.shootingCooldown > 0) player.shootingCooldown -= localDelta;
  if (player.shooting && player.shootingCooldown <= 0) {
    //spawn a bullet
    createBullets(
      player.position,
      player.aimingAt,
      defuseCopter[player.copter].inaccuracy,
      defuseCopter[player.copter].bulletSpeed,
      defuseCopter[player.copter].bulletLifespan,
      defuseCopter[player.copter].bulletCount,
      player.team
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
  bulletCount,
  owner
) {
  for (let c = -((bulletCount - 1) / 2); c < (bulletCount - 1) / 2 + 1; c++) {
    let left = aim.x > fov.width / 2 ? 0 : Math.PI;
    let shootingAngle =
      Math.atan((aim.y - fov.height / 2) / (aim.x - fov.width / 2)) + left;
    shootingAngle +=
      randomFloat(-Math.PI * inaccuracy, Math.PI * inaccuracy) +
      inaccuracy * c * 2 * Math.PI;
    gameData.bullets.push(
      new Bullet(bulletSpeed, position, shootingAngle, bulletLifespan, owner)
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
  Object.entries(mapData.towers).forEach((towerSet) => {
    towerSet[1].forEach((tower) => {
      if (calculateDistance(tower.x, tower.y, x, y) < 4 * TOWER_WIDTH)
        canBuildHere = false;
    });
  });
  if (canBuildHere) {
    Object.entries(mapData.walls).forEach((wallSet) => {
      if (wallSet[0] != 1) {
        //ignore grey walls
        wallSet[1].forEach((wall) => {
          if (
            getDistanceToLine(
              mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].x,
              mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].y,
              mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].x,
              mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].y,
              x,
              y
            ) <
              WALL_WIDTH + 2 * BULLET_WIDTH &&
            wall[2] != 1
          )
            canBuildHere = false;
        });
      }
    });
  }
  if (canBuildHere) {
    mapData.towers[player.team].push({ x: x, y: y, id: towerRegister.length });
    if (typeof player.connectedTo === "number") {
      mapData.walls[player.team].push([
        mapData.towers[player.team][player.connectedTo].id,
        towerRegister.length,
      ]);
    }
    towerRegister.push({
      ar: mapData.towers[player.team].length - 1,
      t: player.team,
    });
  }
}

function updateBullets() {
  let fadedBullets = [];
  gameData.bullets.forEach((bullet, bIndex) => {
    let bounceCounter = 0;
    let bounceAngle = 0;

    let thisLocalDelta =
      localDelta > bullet.lastBounceDelta
        ? localDelta
        : bullet.lastBounceDelta + 0.001;
    bullet.position.x += bullet.velocity.x * thisLocalDelta;
    bullet.position.y += bullet.velocity.y * thisLocalDelta;
    //check for collisions with walls, players, towers

    //walls
    Object.entries(mapData.walls).forEach((wallSet) => {
      if (wallSet[0] != player.team) {
        wallSet[1].forEach((wall) => {
          let xT1 = mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].x;
          let yT1 = mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].y;
          let xT2 = mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].x;
          let yT2 = mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].y;
          let bulletDistanceToWall = getDistanceToLine(
            xT1,
            yT1,
            xT2,
            yT2,
            bullet.position.x,
            bullet.position.y
          );
          if (bulletDistanceToWall * 2 <= WALL_WIDTH + BULLET_WIDTH) {
            bounceCounter++;
            bounceAngle += getBounceBulletAngle(
              bullet.velocity,
              { x: xT1, y: yT1 },
              { x: xT2, y: yT2 }
            );
          }
        });
      }
    });
    if (bounceCounter > 0) {
      bullet.velocity = bounceBullet(
        bullet.velocity,
        bounceAngle / bounceCounter
      );
      bullet.lastBounceDelta = delta;
    } else {
      bullet.lastBounceDelta = 0;
    }

    //towers
    let bAlive = true;
    Object.entries(mapData.towers).forEach((towerSet) => {
      if (towerSet[0] != bullet.ownedBy) {
        towerSet[1].forEach((tower, index) => {
          if (bAlive) {
            let distanceToBullet = calculateDistance(
              tower.x,
              tower.y,
              bullet.position.x,
              bullet.position.y
            );
            if (distanceToBullet < BULLET_WIDTH + TOWER_WIDTH) {
              console.log("HIT!");
              bAlive = false;
              bullet.lifespan = 0;
              if (towerSet[0] != 1) {
                deleteTower(towerSet[0], index);
              } //only if not grey tower
            }
          }
        });
      }
    });

    bullet.lifespan -= thisLocalDelta;
    if (bullet.lifespan <= 0) fadedBullets.push(bIndex);
  });
  fadedBullets.forEach((bulletIndex, counter) => {
    gameData.bullets.splice(bulletIndex - counter, 1);
  });
}

function deleteTower(team, towerIndex) {
  mapData.towers[team].splice(towerIndex, 1);
  if (team == player.team) {
    if (!towerIndex > player.connectedTo) {
      if (towerIndex == player.connectedTo) {
        player.connectedTo = false;
      } else {
        player.connectedTo--;
      }
    }
  }
  let registerToDelete = 0;
  towerRegister.forEach((dataSet, regIndex) => {
    if (dataSet.t == team) {
      if (ar == index) {
        registerToDelete = regIndex;
      } else if (ar > index) {
        dataSet.ar--;
      }
    }
  });
  mapData.walls[team].forEach((wall, index) => {
    if (
      towerRegister[wall[0]].ar == towerIndex ||
      towerRegister[wall[1]].ar == towerIndex
    ) {
      mapData.walls[team].splice(index, 1);
    }
  });
  mapData.areas[team].forEach((area, index) => {
    let hasToBeDeleted = false;
    for (let c = 0; c < area.length; c++) {
      if (towerRegister[area[c]].ar == towerIndex) {
        hasToBeDeleted = true;
        break;
      }
    }
    if (hasToBeDeleted) {
      mapData.areas[team].splice(index, 1);
    }
  });
  towerRegister[registerToDelete] = undefined;
}

function getBounceBulletAngle(bulletVector, t1, t2) {
  let sign = bulletVector.x < 0 ? 0 : 1;
  let alpha = Math.atan((t2.y - t1.y) / (t2.x - t1.x));
  let beta = sign * Math.PI - Math.atan(bulletVector.y / bulletVector.x);
  let gamma = Math.PI - alpha - beta;
  let delta = Math.PI - beta - 2 * gamma;
  //ONLY BOUNCE ONCE EVERY 2 TICS <-- add this (edit: idk)
  return delta;
}
function bounceBullet(bulletVector, angle) {
  let velo = Math.sqrt(
    Math.pow(bulletVector.x, 2) + Math.pow(bulletVector.y, 2)
  );

  return { x: Math.cos(angle) * velo, y: Math.sin(angle) * velo };
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
  if (gameClock % 300 <= localDelta * 1000) {
    fpsDisplay.innerHTML = `fps: ${Math.floor(1 / delta)} spf: ${delta}`;
  }
}

//draw functions
function draw() {
  drawBackground(); //White Background + Grids
  drawObstacles(); //1. Bombs, 2. Spawns, 3. Areas, 4. Walls, 5. Towers, 6. Bullets
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

  //also background stuff like see where tower and wall would spawn
  if (typeof player.connectedTo === "number") {
    let connectedTower = mapData.towers[player.team][player.connectedTo];
    ctx.beginPath();
    ctx.strokeStyle = colors[`f${player.team}`];
    ctx.lineWidth = 5;
    ctx.moveTo(fov.width / 2, fov.height / 2);
    ctx.lineTo(
      relToPlayer.x(connectedTower.x),
      relToPlayer.y(connectedTower.y)
    );
    ctx.stroke();
  }
}

function drawObstacles() {
  Object.entries(mapData.areas).forEach((areaSet) => {
    ctx.fillStyle = colors[`f${areaSet[0]}`];
    areaSet[1].forEach((area) => {
      ctx.beginPath();
      ctx.moveTo(
        relToPlayer.x(mapData.towers[areaSet[0]][towerRegister[area[0]].ar].x),
        relToPlayer.y(mapData.towers[areaSet[0]][towerRegister[area[0]].ar].y)
      );
      area.forEach((edge) => {
        try {
          ctx.lineTo(
            relToPlayer.x(mapData.towers[areaSet[0]][towerRegister[edge].ar].x),
            relToPlayer.y(mapData.towers[areaSet[0]][towerRegister[edge].ar].y)
          );
        } catch (er) {
          console.log(
            `Error -- Edge: ${edge}, Towers: ${
              mapData.towers[areaSet[0]].length
            }`
          );
        }
      });
      ctx.fill();
    });
  });

  ctx.lineWidth = 3;
  mapData.spawns.forEach((spawn, index) => {
    ctx.strokeStyle = colors[`b${index + 1}`];
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

  Object.entries(mapData.walls).forEach((wallSet) => {
    wallSet[1].forEach((wall) => {
      let sX = mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].x;
      let sY = mapData.towers[wallSet[0]][towerRegister[wall[0]].ar].y;
      let eX = mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].x;
      let eY = mapData.towers[wallSet[0]][towerRegister[wall[1]].ar].y;
      ctx.lineWidth = WALL_WIDTH;
      ctx.strokeStyle = colors[`b${wallSet[0]}`];
      ctx.beginPath();
      ctx.moveTo(relToPlayer.x(sX), relToPlayer.y(sY));
      ctx.lineTo(relToPlayer.x(eX), relToPlayer.y(eY));
      ctx.stroke();
      ctx.strokeStyle = colors[wallSet[0]];
      ctx.lineWidth = WALL_WIDTH - 4;
      ctx.beginPath();
      ctx.moveTo(relToPlayer.x(sX), relToPlayer.y(sY));
      ctx.lineTo(relToPlayer.x(eX), relToPlayer.y(eY));
      ctx.stroke();
    });
  });

  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 2;
  Object.entries(mapData.towers).forEach((towerSet) => {
    ctx.fillStyle = colors[towerSet[0]];
    towerSet[1].forEach((tower) => {
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

function buildMap(rawFile = "", format = "defly") {
  let mapFile = rawFile.trimEnd();
  console.log(mapFile);
  console.log(`Loading map - map file format: ${format}`);
  permanentMapData.towers = { 1: [], 2: [], 3: [], 4: [] };
  permanentMapData.walls = { 1: [], 2: [], 3: [], 4: [] };
  permanentMapData.areas = { 1: [], 2: [], 3: [], 4: [] };
  permanentMapData.bombs = [];
  permanentMapData.spawns = [];
  towerRegister = [];
  switch (format) {
    case "defly": {
      let newMapData = mapFile.split(/\s+/);
      newMapData.forEach((identifier, position) => {
        switch (identifier) {
          case "MAP_WIDTH": {
            permanentMapData.width = newMapData[position + 1] * UNIT_WIDTH;
            break;
          }
          case "MAP_HEIGHT": {
            permanentMapData.height = newMapData[position + 1] * UNIT_WIDTH;
            break;
          }
          case "d": {
            let t = isNaN(Number(newMapData[position + 4]))
              ? 1
              : newMapData[position + 4];
            permanentMapData.towers[t].push({
              x: Number(newMapData[position + 2]) * UNIT_WIDTH,
              y: Number(newMapData[position + 3]) * UNIT_WIDTH,
            });
            towerRegister[newMapData[position + 1]] = {
              t: t,
              ar: permanentMapData.towers[t].length - 1,
            };
            break;
          }
          case "l": {
            let t = towerRegister[newMapData[position + 1]].t;
            permanentMapData.walls[t].push([
              Number(newMapData[position + 1]),
              Number(newMapData[position + 2]),
            ]);
            break;
          }
          case "z": {
            let thisShadingsID = [];
            for (let c = 1; c < newMapData.length; c++) {
              if (
                isNaN(Number(newMapData[position + c])) ||
                !(newMapData[position + c] >= 0)
              ) {
                c = newMapData.length;
                continue;
              }
              thisShadingsID.push(Number(newMapData[position + c]));
            }
            let t = towerRegister[newMapData[position + 1]].t;
            permanentMapData.areas[t].push(thisShadingsID);
            break;
          }
          case "s": {
            let team = {
              id: Number(newMapData[position + 1]),
            };
            team.name = team.id > 0 ? "red" : "blue";
            permanentMapData.spawns[team.id] = {
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
            permanentMapData.bombs[type.id] = {
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
    case "compact": {
      let newMapData = mapFile.split("|");

      //map size
      let newMapSize = newMapData[0].split(",");
      permanentMapData.width =
        Number(newMapSize[0]) > 0
          ? Number(newMapSize[0]) * UNIT_WIDTH
          : permanentMapData.width;
      permanentMapData.height =
        Number(newMapSize[1]) > 0
          ? Number(newMapSize[1]) * UNIT_WIDTH
          : permanentMapData.height;

      //koth bounds
      //dont need em rn
      //kothBounds = newMapData[1].split(",").length < 4 ? [] : newMapData[1].split(",");

      //defuse bombs
      let bombData = newMapData[2].split(",");
      for (let c = 0; bombData.length > c; c += 2) {
        permanentMapData.bombs[c / 2] = {
          type: c / 2 == 0 ? "a" : "b",
          x: bombData[0 + c] * UNIT_WIDTH,
          y: bombData[1 + c] * UNIT_WIDTH,
        };
      }

      //defuse spawns
      let spawnData = newMapData[3].split(",");
      for (let c = 0; spawnData.length > c; c += 3) {
        permanentMapData.spawns[c / 3 + 1] = {
          x: spawnData[0 + c] * UNIT_WIDTH,
          y: spawnData[1 + c] * UNIT_WIDTH,
        };
        //rotation: spawnData[2 + c],
      }

      //towers (and walls)
      let towerData = newMapData[4].split(";");
      towerData.forEach((rawTower, index) => {
        let tower = rawTower.split(",");
        let t = tower[2] === "" ? 1 : tower[2];
        permanentMapData.towers[t].push({
          x: tower[0] * UNIT_WIDTH,
          y: tower[1] * UNIT_WIDTH,
        });
        towerRegister[index + 1] = {
          t: t,
          ar: permanentMapData.towers[t].length,
        };
        //walls
        for (let c = 3; c < tower.length; c++) {
          permanentMapData.walls[t].push([index + 1, Number(tower[c]) - 1]);
        }
      });

      //shading
      let shadingData = newMapData[5].split(";");
      shadingData.forEach((rawShading) => {
        let shading = rawShading.split(",");
        let ids = [];
        shading.forEach((tId) => {
          ids.push(Number(tId));
        });
        let t = towerRegister[ids[0]].t;
        permanentMapData.shading[t].push(ids);
      });
      break;
    }
  }
  //working here but nrn idk
  /*let newMapData = JSON.parse(mapFile);
  mapFile.width = newMapData.width;for different map formats later
  mapFile.height = newMapData.height;*/
  resetMap();
}

function resetMap() {
  mapData.width = permanentMapData.width;
  mapData.height = permanentMapData.height;
  mapData.towers = permanentMapData.towers;
  mapData.walls = permanentMapData.walls;
  mapData.areas = permanentMapData.areas;
  mapData.spawns = permanentMapData.spawns;
  mapData.bombs = permanentMapData.bombs;
}

function checkSettings() {
  //let url = window.location.search;
  if (typeof Storage !== undefined) {
    let mapToBuild = localStorage.getItem("auto-saved-map");
    if (!!mapToBuild) {
      buildMap(mapToBuild, "defly");
    }
  }
  setup();
}
