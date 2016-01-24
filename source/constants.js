var c = {
  MAX_DELTA: 1/30,
  GRAVITY: 300,
  PLAYER_ACCELERATION: 1200,
  PLAYER_MAX_SPEED: 300,
  PLAYER_JUMP_HEIGHT: 100,
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  PLAYER_MAX_HEALTH: 5,
};

c.PLAYER_JUMP_SPEED = Math.sqrt(2 * c.GRAVITY * c.PLAYER_JUMP_HEIGHT);

module.exports = c;