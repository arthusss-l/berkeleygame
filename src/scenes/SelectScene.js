import Phaser from 'phaser';
import { CHARACTERS, CHARACTER_ORDER } from '../characters.js';

export class SelectScene extends Phaser.Scene {
  constructor() {
    super('SelectScene');
  }

  create() {
    this.index = 0;
    const g = this.add.graphics();
    g.fillGradientStyle(0x003262, 0x003262, 0x1a1446, 0x1a1446, 1);
    g.fillRect(0, 0, 960, 540);

    this.add.text(480, 52, 'BERKELEY: THE GAME', {
      fontFamily: 'Impact, sans-serif', fontSize: '56px', color: '#fdb515', stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(480, 100, 'choose your fighter', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    this.cards = CHARACTER_ORDER.map((id, i) => {
      const c = CHARACTERS[id];
      const x = 180 + i * 300;
      const card = this.add.container(x, 300);
      const bg = this.add.rectangle(0, 0, 260, 330, 0x000000, 0.35).setStrokeStyle(4, 0x555577);
      const portrait = this.add.image(0, -40, `${id}_portrait`);
      const name = this.add.text(0, 110, c.name(), {
        fontFamily: 'Impact, sans-serif', fontSize: '30px', color: '#ffffff',
      }).setOrigin(0.5);
      const moves = this.add.text(0, 146, `${c.normal.name} · ★ ${c.super.name}`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#d9b8ff',
      }).setOrigin(0.5);
      card.add([bg, portrait, name, moves]);
      card.setSize(260, 330).setInteractive({ useHandCursor: true });
      card.on('pointerover', () => this.select(i));
      card.on('pointerdown', () => { this.select(i); this.start(); });
      return { card, bg, portrait, id };
    });

    this.tagline = this.add.text(480, 490, '', {
      fontFamily: 'monospace', fontSize: '16px', color: '#fdb515',
    }).setOrigin(0.5);
    this.add.text(480, 518, '← → to choose · ENTER to play', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.select((this.index + 2) % 3));
    kb.on('keydown-A', () => this.select((this.index + 2) % 3));
    kb.on('keydown-RIGHT', () => this.select((this.index + 1) % 3));
    kb.on('keydown-D', () => this.select((this.index + 1) % 3));
    kb.on('keydown-ENTER', () => this.start());
    kb.on('keydown-SPACE', () => this.start());

    this.select(0);
  }

  select(i) {
    this.index = i;
    this.cards.forEach((c, j) => {
      const on = i === j;
      c.bg.setStrokeStyle(4, on ? 0xfdb515 : 0x555577);
      c.card.setScale(on ? 1.05 : 0.95);
      c.portrait.setTexture(on ? `${c.id}_portrait_super` : `${c.id}_portrait`);
    });
    this.tagline.setText(CHARACTERS[this.cards[i].id].tagline);
  }

  start() {
    const id = this.cards[this.index].id;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LevelScene', { character: id }));
  }
}
