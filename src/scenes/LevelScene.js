import Phaser from 'phaser';

// Placeholder level: colored rectangles stand in for real art until we draw sprites.
export class LevelScene extends Phaser.Scene {
  constructor() {
    super('LevelScene');
  }

  create() {
    const worldWidth = 3000;
    this.physics.world.setBounds(0, 0, worldWidth, 540);

    // Generate placeholder textures
    const g = this.add.graphics();
    g.fillStyle(0x3b7d23).fillRect(0, 0, 64, 32);
    g.generateTexture('ground', 64, 32);
    g.clear();
    g.fillStyle(0xfdb515).fillRect(0, 0, 28, 40);
    g.generateTexture('player', 28, 40);
    g.destroy();

    // Ground + platforms
    const platforms = this.physics.add.staticGroup();
    for (let x = 0; x < worldWidth; x += 64) {
      platforms.create(x + 32, 524, 'ground');
    }
    [
      [400, 420], [600, 340], [850, 280], [1150, 380],
      [1400, 300], [1700, 240], [2000, 360], [2350, 300],
    ].forEach(([x, y]) => {
      platforms.create(x, y, 'ground');
      platforms.create(x + 64, y, 'ground');
    });

    // Player
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    // Goal (the Campanile, eventually)
    const goal = this.add.rectangle(2850, 444, 40, 120, 0xffffff);
    this.physics.add.existing(goal, true);
    this.physics.add.overlap(this.player, goal, () => {
      this.add.text(this.cameras.main.scrollX + 480, 200, 'Go Bears!', {
        fontSize: '48px', color: '#003262', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.physics.pause();
    });

    this.cameras.main.setBounds(0, 0, worldWidth, 540);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');

    this.add.text(16, 16, 'Arrows / WASD to move, Space to jump', {
      fontSize: '18px', color: '#003262',
    }).setScrollFactor(0);
  }

  update() {
    const { left, right, up } = this.cursors;
    const onGround = this.player.body.blocked.down;

    if (left.isDown || this.keys.A.isDown) this.player.setVelocityX(-260);
    else if (right.isDown || this.keys.D.isDown) this.player.setVelocityX(260);
    else this.player.setVelocityX(0);

    const jump = up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;
    if (jump && onGround) this.player.setVelocityY(-620);
  }
}
