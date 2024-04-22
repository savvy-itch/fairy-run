import {
  spriteX, 
  spriteY, 
  idleVelocity, 
  jumpSprites, 
  offsetPerFrame,
  obstacles,
  maxObstaclesPerScreen,
  canvasWidth,
  canvasHeight,
  scoreCharsAmount,
  initScoreVel,
  maxLevel,
  spriteXPadding,
  spriteXNoPadding,
  spriteYNoPadding,
  deadSprites,
  runSprites,
  spriteDeadXPadding,
  spriteDeadXNoPadding
} from './config.js';
import {createSingleObstacle} from './obstacles.js'

const canvas = document.querySelector('.playfield');
const scoreSpan = document.getElementById('score');
const dialogWindow = document.getElementById('dialog');
const width = canvas.width = canvasWidth;
const height = canvas.height = canvasHeight;
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'beige';
ctx.fillRect(0, 0, width, height);
ctx.translate(0, -height * 0.3);
ctx.strokeRect(0, 0, width, height);

let startGame = false; 
let isJumpPressed = false;
let isRunning = false;
let isIdle = false;
let isDead = false;
let sprite = 0;
let frame = 0;
let velocity = 5;
let loopId;
let score = 0;

const imageRun = new Image();
imageRun.src = "../images/character/Run.png";
document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && !startGame) {
    startGame = true;
    isRunning = true;
    isIdle = false;
    isDead = false;
    score = 0;
    displayScore();
  }
});

const imageIdle = new Image();
imageIdle.src = "../images/character/Idle.png";

const imageJump = new Image();
imageJump.src = "../images/character/Jump.png";
document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && startGame && !isJumpPressed) {
    sprite = 0;
    isRunning = false;
    isJumpPressed = true;
  }
});

const imageDead = new Image();
imageDead.src = "../images/character/Dead.png";

document.addEventListener('DOMContentLoaded', () => {
  let loadedImgs = 0;
  for (let i = 0; i < obstacles.length; i++) {
    const img = new Image();
    img.src = obstacles[i].imgSrc;
    img.onload = () => {
      loadedImgs++;
      if (loadedImgs === obstacles.length) {
        isIdle = true;
        loop();
      }
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Escape') {
    console.log('abort');
    endGame();
  }
});

function endGame() {
  window.cancelAnimationFrame(loopId);
  isRunning = false;
  isJumpPressed = false;
  isIdle = false;
  startGame = false;
  // displayDialog();
}

function displayDialog() {
  dialogWindow.classList.add('show-dialog');
}

// =========== Character ===============

class Hero {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  drawIdle() {
    ctx.drawImage(
      imageIdle, 
      (sprite * spriteX) + spriteXPadding, // top-left corner of the slice to cut out (X)
      0, // top-left corner of the slice to cut out (Y)
      spriteXNoPadding, // the size of the slice to cut out (X)
      spriteYNoPadding, // the size of the slice to cut out (Y)
      this.x, // top-left corner of canvas box into which to draw the slice (X)
      this.y, // top-left corner of canvas box into which to draw the slice (Y)
      spriteXNoPadding, // the size of the image on the canvas (X)
      spriteYNoPadding // the size of the image on the canvas (Y)
    );
    ctx.strokeRect(this.x, this.y, spriteXNoPadding, spriteYNoPadding);

  slowFramerate(idleVelocity, 4);

  frame++;
  }

  drawRun() {
    ctx.drawImage(
      imageRun,
      (sprite * spriteX) + spriteXPadding, // top-left corner of the slice to cut out (X)
      spriteY - spriteYNoPadding, // top-left corner of the slice to cut out (Y)
      spriteXNoPadding, // the size of the slice to cut out (X)
      spriteYNoPadding, // the size of the slice to cut out (Y)
      this.x, // top-left corner of canvas box into which to draw the slice (X)
      this.y, // top-left corner of canvas box into which to draw the slice (Y)
      spriteXNoPadding, // the size of the image on the canvas (X)
      spriteYNoPadding // the size of the image on the canvas (Y)
    );
    ctx.strokeRect(this.x, this.y, spriteXNoPadding, spriteYNoPadding);
  
    slowFramerate(velocity, runSprites);
  
    frame++;
  }

  drawJump() {
    ctx.drawImage(
      imageJump,
      (sprite * spriteX) + spriteXPadding, // top-left corner of the slice to cut out (X)
      spriteY - spriteYNoPadding, // top-left corner of the slice to cut out (Y)
      spriteXNoPadding, // the size of the slice to cut out (X)
      spriteYNoPadding, // the size of the slice to cut out (Y)
      this.x, // top-left corner of canvas box into which to draw the slice (X)
      this.y - posY, // top-left corner of canvas box into which to draw the slice (Y)
      spriteXNoPadding, // the size of the image on the canvas (X)
      spriteYNoPadding // the size of the image on the canvas (Y)
    );
    ctx.strokeRect(this.x, this.y - posY, spriteXNoPadding, spriteYNoPadding);
    
    slowFramerate(4, jumpSprites);
  
    // accending and descending
    if (sprite < Math.ceil(jumpSprites / 2)) {
      posY = sprite * offsetPerFrame;
    } else {
      posY = (jumpSprites - sprite) * offsetPerFrame;
    }
  
    frame++;
    
    // end of the jump
    if (sprite === jumpSprites) {
      sprite = 0;
      frame = 0;
      isJumpPressed = false;
      isRunning = true;
    }
    // console.log(this.x, this.y);
  }

  // 76px
  drawDead() {
    ctx.drawImage(
      imageDead,
      (sprite * spriteX) + spriteDeadXPadding, // top-left corner of the slice to cut out (X)
      spriteY - spriteYNoPadding, // top-left corner of the slice to cut out (Y)
      spriteDeadXNoPadding, // the size of the slice to cut out (X)
      spriteYNoPadding, // the size of the slice to cut out (Y)
      this.x, // top-left corner of canvas box into which to draw the slice (X)
      this.y - posY, // top-left corner of canvas box into which to draw the slice (Y)
      spriteDeadXNoPadding, // the size of the image on the canvas (X)
      spriteYNoPadding // the size of the image on the canvas (Y)
    );
    ctx.strokeRect(this.x, this.y - posY, spriteDeadXNoPadding, spriteYNoPadding);

    if (sprite === deadSprites) {
      endGame();
    } else {
      slowFramerate(velocity, deadSprites);
      frame++;
    }
  }

  detectCollision(obstacleX, obstacleY) {
    if (obstacleX <= (this.x + spriteXNoPadding) 
      && obstacleX >= this.x
      && obstacleY <= (this.y - posY + spriteYNoPadding)) {
        return true;
      // console.log(
      //   `collision detected: 
      //   obstacleX <= (this.x + spriteXNoPadding)=${obstacleX}, ${this.x + spriteXNoPadding}, 
      //   bstacleY <= (this.y - posY + spriteYNoPadding)=${obstacleY}, ${this.y - posY + spriteYNoPadding}`
      // );
      // endGame();
    }
    return false;
  }
}

const hero = new Hero(20, height - spriteYNoPadding);

let posY = 0;

function slowFramerate(velocity, numOfSprites) {
  if (frame % velocity === 0) {
    if (sprite === numOfSprites) {
      sprite = 0;
      frame = 0;
    } else {
      sprite++;
    }
  }
}

let obstacleArray = Array.from({length: maxObstaclesPerScreen});
let obstacleVelocity = 6;
let scoreFreq = 0;
let scoreVel = 20;
let level = 1;
const maxScore = Number(String('').padStart(scoreCharsAmount, '9'));

function displayScore() {
  scoreSpan.textContent = String(score).padStart(scoreCharsAmount, '0');
}

function updateScore() {
  if (score === maxScore) {
    endGame();``
  }
  scoreFreq++;

  if (scoreFreq === scoreVel) {
    score++;
    displayScore();
    scoreFreq = 0;

    if (score > 0 && (score % 100 === 0) && level < maxLevel) {
      level++;
      obstacleVelocity += .9;
      updateObstacleVel();
      scoreVel = initScoreVel * ((100 - (level * 10)) / 100);
    }
  }
}

function updateObstacleVel() {
  for (const item of obstacleArray) {
    item.vel = obstacleVelocity;
  }
}

function loop() {
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < obstacleArray.length; i++) {
    if (obstacleArray[i].isVisible) {
      obstacleArray[i].drawObstacle(ctx);
    }

    // only start moving obstacles once the game has started
    if (startGame && !isDead) {
      obstacleArray[i].updateObstacle(ctx);
      updateScore();
      if (hero.detectCollision(obstacleArray[i].x, obstacleArray[i].y)) {
        isDead = true;
        isRunning = false;
        isJumpPressed = false;
        isIdle = false;
      }
      // if a character passed an obstacle
      if (obstacleArray[i].isPassed) {
        // generate new obstacle
        obstacleArray[i] = createSingleObstacle(obstacleArray, obstacleVelocity);
      }
    }
  }

  if (isRunning) {
    hero.drawRun();
  } else if (isJumpPressed) {
    hero.drawJump();
  } else if (isIdle) {
    hero.drawIdle();
  } else if (isDead) {
    hero.drawDead();
  }

  loopId = window.requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < maxObstaclesPerScreen; i++) {
    obstacleArray[i] = createSingleObstacle(obstacleArray, obstacleVelocity);
  }
  displayScore();
});