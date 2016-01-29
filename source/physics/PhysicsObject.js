var pixi = require('pixi.js');
var constants = require('../constants');
var collision = require('./collision');

var TILE = constants.TILE_SIZE;
var tempRect = new pixi.Rectangle();
var tempData = {};

function PhysicsObject(x, y, w, h) {
  this.velocity = new pixi.Point(0, 0);
  this.grounded = true;
  this.gravityScale = 1.0;
  this._bounds = new pixi.Rectangle(x, y, w, h);
  this.container = new pixi.Container();
  this.faceVelocityX = true;
  this.currentSprite = null; // TODO consider removing
}

var Align = PhysicsObject.Align = {
  TOP_LEFT:      new pixi.Point(0.0, 0.0),
  TOP_CENTER:    new pixi.Point(0.5, 0.0),
  TOP_RIGHT:     new pixi.Point(1.0, 0.0),
  MIDDLE_LEFT:   new pixi.Point(0.0, 0.5),
  MIDDLE_CENTER: new pixi.Point(0.5, 0.5),
  MIDDLE_RIGHT:  new pixi.Point(1.0, 0.5),
  BOTTOM_LEFT:   new pixi.Point(0.0, 1.0),
  BOTTOM_CENTER: new pixi.Point(0.5, 1.0),
  BOTTOM_RIGHT:  new pixi.Point(1.0, 1.0),
}

PhysicsObject.Align.CENTER = 
  PhysicsObject.Align.MIDDLE_CENTER;

PhysicsObject.prototype = {
  getBounds: function getBounds() {
    return this._bounds;
  },
  updateContainer: function updateContainer() {
    if (this.faceVelocityX && this.velocity.x != 0 &&
        Math.sign(this.velocity.x) != Math.sign(this.container.scale.x)) {
      this.container.scale.x *= -1;
    }
    this.container.x = this._bounds.x;
    if (this.container.scale.x < 0) {
      this.container.x += this._bounds.width;
    }
    this.container.y = this._bounds.y;
  },
  setSprite: function setSprite(spr, anchor) {
    // TODO center? yes? no? maybe?
    if (anchor) {
      spr.anchor.copy(anchor);
      spr.x = this._bounds.width * anchor.x;
      spr.y = this._bounds.height * anchor.y;
    }
    this.container.removeChildren();
    this.container.addChild(spr);
    this.currentSprite = spr;
  },
  setMovieClip: function setMovieClip(clip, anchor, restart) {
    this.setSprite(clip, anchor);
    if (restart) {
      clip.gotoAndPlay(0);
    }
  },
  translate: function translate(dx, dy) {
    this._bounds.x += dx;
    this._bounds.y += dy;
    this.updateContainer();
  },
  setPosition: function setPosition(x, y) {
    this._bounds.x = x;
    this._bounds.y = y;
    this.updateContainer();
  },
  setCenter: function setCenter(x, y) {
    this.setPosition(x - this._bounds.width/2, y - this._bounds.height/2);
  },
  getCenterX: function getCenterX() {
    return this._bounds.x + this._bounds.width/2;
  },
  getCenterY: function getCenterY() {
    return this._bounds.y + this._bounds.height/2;
  },
  getPosition: function getPosition() {
      return new pixi.Point(this._bounds.x, this._bounds.y);
  },
  updatePhysics: function(delta, tiles) {
    this.grounded = false;
    this.velocity.y += constants.GRAVITY * this.gravityScale * delta;
    this.translate(this.velocity.x * delta, this.velocity.y * delta);
    this.updateContainer();
  },
  updateWorldCollisions: function(tileGrid, gfx) {
    var bounds = this.getBounds();
    var minX = Math.floor(bounds.x/TILE);
    var maxX = Math.ceil((bounds.x + bounds.width)/TILE);
    var minY = Math.floor(bounds.y/TILE);
    var maxY = Math.ceil((bounds.y + bounds.height)/TILE);
    for (var ix = minX; ix < maxX; ix++) {
      for (var iy = minY; iy < maxY; iy++) {
        var solid = tileGrid.get(ix, iy);
        // if (!solid) continue;
        tempRect.x = ix * TILE;
        tempRect.y = iy * TILE;
        tempRect.width = TILE;
        tempRect.height = TILE;
        if (!solid) continue;
        tempData.ignoreUp = tileGrid.get(ix, iy - 1);
        tempData.ignoreDown = tileGrid.get(ix, iy + 1);
        tempData.ignoreLeft = tileGrid.get(ix - 1, iy);
        tempData.ignoreRight = tileGrid.get(ix + 1, iy);
        collision.collidePhysicsTile(this, tempRect, tempData);
      }
    }
    this.updateContainer();
  },
};

module.exports = PhysicsObject;