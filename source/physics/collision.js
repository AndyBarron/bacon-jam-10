import * as pixi from 'pixi.js';
import * as constants from '../constants';

export function getRectangleOverlap(a, b) {
  let l = Math.max(a.x, b.x); // rightmost left
  let r = Math.min(a.x + a.width, b.x + b.width); // leftmost right
  let t = Math.max(a.y, b.y); // lowest top
  let bot = Math.min(a.y + a.height, b.y + b.height); // highest bottom
  let result = null;
  if (r > l && bot > t) {
    result = new pixi.Rectangle(l, t, r - l, bot - t);
  }
  return result;
}
export function collidePhysicsTile(phys, tileRect, tileData) {
  let overlap = getRectangleOverlap(phys.getBounds(), tileRect);
  if (overlap) {
    let charCenter = phys.getBounds().getCenter();
    let tileCenter = tileRect.getCenter();
    let ignoreVertical = tileData.ignoreUp && tileData.ignoreDown;
    let ignoreHorizontal = tileData.ignoreLeft && tileData.ignoreRight;
    if (overlap.width > overlap.height && !tileData.ignoreVertical) { // char moves vertically
      if (tileCenter.y >= charCenter.y && !tileData.ignoreUp) { // move up
        phys.grounded = true;
        phys.getBounds().y -= overlap.height;
        if (phys.velocity.y > 0) {
          phys.velocity.y = 0;
        }
      } else if (!tileData.ignoreDown) { // move down
        phys.getBounds().y += overlap.height;
        if (phys.velocity.y < 0) {
          phys.velocity.y = 0;
        }
      }
    } else if (!tileData.ignoreHorizontal) { // char moves horizontally
      if (tileCenter.x >= charCenter.x && !tileData.ignoreLeft) { // move left
        phys.getBounds().x -= overlap.width;
        if (phys.velocity.x > 0) {
          phys.velocity.x = 0;
        }
      } else if (!tileData.ignoreRight) { // move right
        phys.getBounds().x += overlap.width;
        if (phys.velocity.x < 0) {
          phys.velocity.x = 0;
        }
      }
    }
  }
  return overlap;
}
// TODO move most of this logic to Player and Enemy
export function resolveEnemyCollision(player, enemy) {
  let charSprite = player.sprite;
  let enemySprite = enemy.Sprite;
  let overlap = getRectangleOverlap(player.getBounds(), enemy.getBounds());
  if(overlap && !player.recentHit) {
    let charCenter = player.getBounds().getCenter();
    let enemyCenter = enemy.getBounds().getCenter();
    player.hitPoints-=1;
    player.recentHit = true;
    player.grounded = false;
    player.canCancelJump = false;

    if(enemyCenter.x > charCenter.x){
      player.velocity.x = -constants.PLAYER_BOUNCE_SPEED_X;
    }
    else{
      player.velocity.x = constants.PLAYER_BOUNCE_SPEED_X;
    }

    player.velocity.y = -constants.PLAYER_BOUNCE_SPEED_Y;
    player.translate(0, -2);
  }
  return overlap;
}
