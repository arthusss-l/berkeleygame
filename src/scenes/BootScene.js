import Phaser from 'phaser';
import { generateAllTextures } from '../art/sprites.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    generateAllTextures(this);
    // Dev shortcut: ?char=guy&x=3200 jumps straight into the level.
    const params = new URLSearchParams(window.location.search);
    if (import.meta.env.DEV && params.has('char')) {
      this.scene.start('LevelScene', { character: params.get('char'), startX: Number(params.get('x')) || undefined, aura: Number(params.get('aura')) || 0 });
      return;
    }
    this.scene.start('SelectScene');
  }
}
