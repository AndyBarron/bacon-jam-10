var pixi = require('pixi.js');
var colors = require('../colors');
var Player = require("../objects/Player");
var keyboard = require("../keyboard");

function TestScreen() {
  this.stage = new pixi.Container();

  this.player = new Player(new pixi.Sprite.fromImage('/graphics/space_guy.png'));

  this.player.sprite.x = 300;
  this.player.sprite.y = 300;

  this.stage.addChild(this.player.sprite);

  this.update = function update(delta) {
    this.movePlayer(delta);
  };

  this.getStage = function getStage() {
    return this.stage;
  };
};

TestScreen.prototype = {
  movePlayer: function movePlayer(delta) {
    if (keyboard.isKeyDown(keyboard.W)) {
      this.player.move(0, -this.player.speed * delta);
    }

    if (keyboard.isKeyDown(keyboard.A)) {
      this.player.move(-this.player.speed * delta, 0);
    }

    if (keyboard.isKeyDown(keyboard.S)) {
      this.player.move(0, this.player.speed * delta);
    }

    if (keyboard.isKeyDown(keyboard.D)) {
      this.player.move(this.player.speed * delta, 0);
    }
  }
}

module.exports = TestScreen;

