import * as debug from '../debug';
import FanCurrent from '../objects/FanCurrent';

import * as pixi from 'pixi.js';
import BaseScene from './BaseScene';
import Player from '../objects/Player';
import CleanBot from '../objects/CleanBot';
import * as keyboard from "../keyboard";
import * as howler from "howler";
import * as assets from '../assets';
import * as constants from '../constants';
import * as collision from '../physics/collision';
import StageClearScene from './StageClearScene';
import * as game from '../game';
import TileGrid from '../data-structures/TileGrid';
import Console from '../objects/Console';
import MainMenuScene from './MainMenuScene';
import LevelLoadingScene from './LevelLoadingScene';
import SharpText from '../interface/SharpText';

let TILE = constants.TILE_SIZE;

let HELP_TEXT_PADDING = 10;

export default class GameplayScene extends BaseScene {

  // TODO slim this bad boy down, yeesh
  constructor(levelData, levelInfo) {
    super()
    if (!levelData) debug.error("No level data!");
    if (!levelInfo) debug.error("No level info!");
    this.levelData = levelData;
    this.levelInfo = levelInfo;
    // member variables
    this.backgroundColor = 0x0;
    this.player = new Player();
    this.enemies = [];
    this.tileGrid = levelData.grid;
    this.exitRect = null;
    this.hearts = [];
    this.paused = false;
    this.died = false;
    this.helpTextFontLabel = 'px monospace';
    this.helpText = new SharpText('', {
      font: '0' + this.helpTextFontLabel,
      wordWrap: true,
      wordWrapWidth: 0,
      align: 'center',
      fill: 0x00DD00,
      // stroke: 0x000000,
      // strokeThickness: 4,
    });
    this.helpText.visible = false;
    this.helpText.anchor = new pixi.Point(0.5, 1.0);
    this.helpBg = new pixi.Graphics();
    this.helpBg.boundsPadding = 0;
    this.helpBg.alpha = 0.5;
    this.helpBg.visible = false;
    this.helpBg.beginFill(0x001100);
    this.helpBg.drawRect(0,0,1,1);
    this.helpBg.endFill();
    this.ui.addChild(this.helpBg);
    this.ui.addChild(this.helpText);
    this.playerColliders = [];
    this.restarted = false;
    this.deathY = (levelData.grid.getHeight() + 10) * TILE;

    // TODO generic bg layer system?
    this.starClip = assets.movieClip('bg/starfield/', {
      animationSpeed: 1/45,
    })
    this.starClip.play();
    this.bgSprite = new pixi.extras.TilingSprite(this.star1, 0, 0);
    this.background.addChild(this.bgSprite);
    this.bgHull = new pixi.extras.TilingSprite(assets.texture('bg/hull'), 0, 0);
    this.background.addChild(this.bgHull);
    this.bgCols = new pixi.extras.TilingSprite(assets.texture('bg/column'), 0, 0);
    this.background.addChild(this.bgCols);
    this.tilingSprites = [this.bgSprite, this.bgHull, this.bgCols];
    this.bgSprite.tint = 0x666688;
    this.bgHull.tint = 0x555555;
    this.bgCols.tint = 0x777777;

    // Load level data
    // Load tiles/geometry
    for (let tileSprite of levelData.tileSprites) {
      this.world.addChild(tileSprite);
    }
    // Set player position
    this.player.setCenter(levelData.playerCenter);
    // Set up consoles
    for (let consCfg of levelData.consoleList) {
      let {bounds, text} = consCfg;
      let cons = new Console(bounds, text, this.helpText, this.helpBg, this.player);
      this.playerColliders.push(cons);
      this.world.addChild(cons.sprite);
    }
    // Set up currents
    for (let bounds of levelData.fanCurrentBoundsList) {
      let fc = new FanCurrent(bounds);
      this.playerColliders.push(fc);
      this.world.addChild(fc.sprite);
    }
    // Set up enemies
    this.enemies = levelData.enemyCenterList.map((center) => {
      let enemy = new CleanBot(0, 0, this.player);
      enemy.setCenter(center.x, center.y);
      this.world.addChild(enemy.container);
      return enemy;
    });
    // Set up exit
    this.exitRect = levelData.exitBounds.clone();
    let exit = assets.sprite("objects/spill");
    exit.anchor.set(0.5, 1.0);
    exit.x = this.exitRect.getCenter().x;
    exit.y = this.exitRect.y + this.exitRect.height + 3;
    this.world.addChild(exit);
    

    // Add player last -- always on top
    this.world.addChild(this.player.container);

    for (let i = 0; i < constants.PLAYER_MAX_HEALTH; i++) {
      let heart = assets.sprite('ui/heart/full');
      heart.x = 5 + i * heart.width + (i * 1);
      heart.y = 5;
      this.hearts.push(heart);
      this.ui.addChild(heart);
    }


    // Death Overlay
    this.deathOverlay = new pixi.Container();
    this.deathGraphics = new pixi.Graphics();
    this.deathText = new SharpText('YOU DIED.', {
      font: '20px monospace',
      fill: 0xFF00CC,
    });
    this.deathText.anchor = new pixi.Point(0.5, -1);
    this.deathText.position = game.display.topCenter;
    this.deathRestartText = new SharpText('[RETURN] TO RESTART, [Q] TO QUIT', {
      font: '20px monospace',
      fill: 0xFF00FF,
    });
    this.deathRestartText.anchor = new pixi.Point(0.5, 0.5);
    this.deathRestartText.position = game.display.center;
    this.deathOverlay.addChild(this.deathText);
    this.deathOverlay.addChild(this.deathRestartText);
    this.deathOverlay.addChild(this.deathGraphics);
    this.ui.addChild(this.deathOverlay);
    this.deathOverlay.visible = false;

    // Pause Overlay
    this.pausedOverlay = new pixi.Container();
    this.pauseGraphics = new pixi.Graphics();
    this.pauseText = assets.sprite('text/pause');
    this.pauseText.anchor = new pixi.Point(-0.5, 0.5);
    this.pauseText.position = game.display.topCenter;
    this.restartText = new SharpText('[ESC] TO CONTINUE, [Q] TO QUIT, [RETURN] TO RESTART', {
      font: '20px monospace',
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 400,
      align: 'center',
    });
    this.restartText.anchor = new pixi.Point(0.5, 0.5);
    this.restartText.position = game.display.center;
    this.pausedOverlay.addChild(this.pauseText);
    this.pausedOverlay.addChild(this.restartText);
    this.pausedOverlay.addChild(this.pauseGraphics);
    this.ui.addChild(this.pausedOverlay);
    this.pausedOverlay.visible = false;
  }

  initialize() {
    assets.playMusic('music/gameplay/action');
  }
  dispose() {
    if (!this.restarted) {
      assets.stopMusic();
    }
  }
  resize(w, h) {
    this.helpText.style.wordWrapWidth = w - HELP_TEXT_PADDING * 2;
    let fontSize = game.worldPixelsFromScreen(36);
    this.helpText.style.font = fontSize.toString() + this.helpTextFontLabel;
    this.deathGraphics.clear();
    this.deathGraphics.beginFill(0x000000, 0.5);
    this.deathGraphics.drawRect(0,0,w,h);
    this.deathGraphics.endFill();
    this.pauseGraphics.clear();
    this.pauseGraphics.beginFill(0x000000, 0.5);
    this.pauseGraphics.drawRect(0,0,w,h);
    this.pauseGraphics.endFill();
    this.tilingSprites.forEach(function(ts) {
      ts.width = w;
      ts.height = h;
    });
  }
  update(delta) {
    this.ui.update(delta); // Always update UI
    this.bgSprite.texture = this.starClip.texture;
    if (this.helpText.visible) {
      let padding = HELP_TEXT_PADDING;
      this.helpText.position.copy(game.display.bottomCenter);
      this.helpText.position.y -= padding;
      this.helpText.updateTransform();
      let box = this.helpText.getBounds();
      box = game.worldRectFromScreen(box);
      box.pad(padding); // TODO world or screen pixels?
      let wDiff = this.helpText.style.wordWrapWidth + HELP_TEXT_PADDING * 2 - box.width;
      box.x -= wDiff / 2;
      box.width += wDiff;
      this.helpBg.x = box.x
      this.helpBg.y = box.y;
      this.helpBg.width = box.width;
      this.helpBg.height = box.height;
    }

    if(this.died) {
      if (keyboard.isKeyPressed(keyboard.RETURN)) {
        this.restarted = true;
        return new GameplayScene(this.levelData, this.levelInfo);
      }
      if (keyboard.isKeyPressed(keyboard.Q)) {
        return new MainMenuScene(this.levelData, this.levelInfo);
      }      
      return;
    };

    if(this.paused) {
      if (keyboard.isKeyPressed(keyboard.RETURN)) {
        this.restarted = true;
        return new GameplayScene(this.levelData, this.levelInfo);
      } else if (keyboard.isKeyPressed(keyboard.Q)) {
        return new MainMenuScene();
      }
    };


    if (keyboard.isKeyPressed(keyboard.ESC)) {
      this.paused = !this.paused;

      this.pausedOverlay.visible = this.paused;
    }

    if (this.paused) return;


    if (this.player.grounded && collision.getRectangleOverlap(
        this.player.getBounds(),
        this.exitRect)) {
      let nextScene = null;
      let nextLevel = assets.getLevelInfo(this.levelInfo.index + 1);
      if (nextLevel) {
        this.restarted = true;
        nextScene = new LevelLoadingScene(nextLevel);
      } else {
        nextScene = new StageClearScene(); // TODO this has a next level property
      }
      return nextScene;
    }

    let self = this;

    self.bgSprite.tilePosition.x -= 10 * delta;

    // Update Player
    self.player.update(delta, self);

    // update fan currents
    self.player.lifted = false;
    self.playerColliders.forEach((fc) => {
      fc.testCollision(self.player, self.player.getBounds());
    });


    // update aliens
    self.enemies.forEach(function(enemy) {
      enemy.update(delta, self);
    });

    //update health
    while (self.hearts.length > self.player.hitPoints && self.hearts.length > 0) {
      let last = self.hearts.pop();
      last.texture = assets.texture('ui/heart/empty');
    }

    // Have screen follow the player
    this.world.x =
      -Math.round(this.player.getBounds().x) +
      -Math.round(this.player.getWidth() / 2) +
      Math.round(game.display.width / 2);
    this.world.y =
      -Math.round(this.player.getBounds().y) +
      -Math.round(this.player.getHeight() / 2) +
      Math.round(game.display.height / 2);
    this.bgHull.tilePosition.x = this.world.x*1/5;
    this.bgHull.tilePosition.y = this.world.y*1/5;
    this.bgCols.tilePosition.x = this.world.x*1/3;
    this.bgCols.tilePosition.y = this.world.y*1/3;

    // reset on fall
    if (!this.died && this.player.getPosition().y > this.deathY || this.player.hitPoints == 0) {
      this.died = true;
      this.deathOverlay.visible = true;
    }

    // Only update background and foreground anims when not paused
    this.starClip.update(delta);
    this.background.update(delta);
    this.world.update(delta);
  }
}
