import Phaser from 'phaser';
import { CHARACTERS } from '../characters.js';
import { TELEGRAPH } from '../levels/telegraph.js';

const AURA_MAX = 67; // 6-7
const MAX_HEARTS = 3;
const KILL_AURA = 13;
const BEER_AURA = 14;
const ORB_AURA = 5;

const ENEMY_TYPES = {
  tung: { hp: 2, speed: 70, range: 110, hop: false },
  shark: { hp: 1, speed: 130, range: 160, hop: true },
};

export class LevelScene extends Phaser.Scene {
  constructor() {
    super('LevelScene');
  }

  init(data) {
    this.charId = data.character || 'airbus';
    this.startX = data.startX || 100;
    this.char = CHARACTERS[this.charId];
    this.level = TELEGRAPH;
    this.aura = data.aura || 0;
    this.score = 0;
    this.deaths = 0;
    this.shown67 = false;
    this.finished = false;
  }

  create() {
    const L = this.level;
    this.groundY = L.groundY;
    this.physics.world.setBounds(0, -400, L.width, 1400);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.buildBackground();
    this.buildTerrain();
    this.buildGoal();
    this.buildPickups();
    this.buildEnemies();
    this.respawnX = this.startX;
    this.buildPlayer();
    this.buildHud();
    this.setupInput();
    this.setupCollisions();

    this.cameras.main.setBounds(0, 0, L.width, 540);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);
    this.cameras.main.fadeIn(400);

    this.banner(`${L.title}`, L.subtitle);
  }

  // ---------------------------------------------------------------- world --

  buildBackground() {
    const L = this.level;
    const [top, bottom] = L.sky;
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-30);
    sky.fillGradientStyle(top, top, bottom, bottom, 1);
    sky.fillRect(0, 0, 960, 540);

    // Far layer: Berkeley hills + the Campanile.
    const far = this.add.graphics().setScrollFactor(0.15).setDepth(-25);
    far.fillStyle(0x3d3a6b);
    for (let x = -200; x < L.width * 0.2 + 1200; x += 260) {
      far.fillEllipse(x, 400, 520, 260);
    }
    const cx = 700;
    far.fillStyle(0xd9d2c0);
    far.fillRect(cx - 18, 140, 36, 200);
    far.fillTriangle(cx - 22, 140, cx + 22, 140, cx, 90);
    far.fillStyle(0x3d3a6b).fillRect(cx - 8, 160, 16, 22);
    far.fillStyle(0xffd27a).fillCircle(cx, 210, 7); // clock face

    // Mid layer: rooftops.
    const mid = this.add.graphics().setScrollFactor(0.45).setDepth(-20);
    const rnd = new Phaser.Math.RandomDataGenerator(['telegraph-mid']);
    for (let x = -100; x < L.width * 0.45 + 1000; x += rnd.between(90, 160)) {
      const h = rnd.between(140, 260);
      mid.fillStyle(rnd.pick([0x4b3f72, 0x55477d, 0x463a68]));
      mid.fillRect(x, this.groundY - h + 40, rnd.between(80, 150), h);
      mid.fillStyle(0xffd98a, 0.5);
      for (let wy = this.groundY - h + 60; wy < this.groundY; wy += 34) {
        if (rnd.frac() > 0.5) mid.fillRect(x + 14, wy, 10, 14);
        if (rnd.frac() > 0.5) mid.fillRect(x + 40, wy, 10, 14);
      }
    }

    // Street layer: storefronts along Telegraph.
    const street = this.add.graphics().setDepth(-10);
    const rs = new Phaser.Math.RandomDataGenerator(['telegraph-street']);
    let shopIdx = 0;
    for (let x = 0; x < L.goalX - 300; ) {
      const w = rs.between(260, 380);
      const h = rs.between(250, 340);
      const color = rs.pick([0xc98b5e, 0x8fa5a8, 0xd1b48c, 0xa8696b, 0x7c8f6a, 0xb7a3c4]);
      street.fillStyle(color).fillRect(x, this.groundY - h, w - 6, h);
      street.fillStyle(0x000000, 0.15).fillRect(x, this.groundY - h, w - 6, 10);
      // upper windows
      street.fillStyle(0x2d3550);
      for (let wx = x + 24; wx < x + w - 50; wx += 62) {
        street.fillRect(wx, this.groundY - h + 30, 32, 44);
        if (h > 300) street.fillRect(wx, this.groundY - h + 95, 32, 44);
      }
      // storefront
      street.fillStyle(0x1c2236).fillRect(x + 20, this.groundY - 100, w - 110, 100);
      street.fillStyle(0xffe6a8, 0.35).fillRect(x + 26, this.groundY - 94, w - 122, 60);
      street.fillStyle(0x3a2a20).fillRect(x + w - 80, this.groundY - 96, 44, 96);
      const name = L.shops[shopIdx++ % L.shops.length];
      this.add.text(x + (w - 6) / 2, this.groundY - 140, name, {
        fontFamily: 'monospace', fontSize: '20px', fontStyle: 'bold', color: '#fff6dc',
        backgroundColor: '#00000066', padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(-9);
      x += w;
    }

    // Telegraph street sign near the start.
    this.add.rectangle(170, this.groundY - 80, 6, 160, 0x555555).setDepth(-8);
    this.add.text(170, this.groundY - 170, 'TELEGRAPH AVE', {
      fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1d6b3a', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(-8);
  }

  makeTextures() {
    if (this.textures.exists('ground')) return;
    const g = this.make.graphics({ add: false });
    // Sidewalk tile
    g.fillStyle(0xb9b4ad).fillRect(0, 0, 64, 18);
    g.fillStyle(0x9c968f).fillRect(0, 18, 64, 4);
    g.fillStyle(0x8a847d).fillRect(63, 0, 1, 18);
    g.fillStyle(0x3b3b44).fillRect(0, 22, 64, 42);
    g.fillStyle(0x2f2f37).fillRect(8, 36, 10, 4).fillRect(38, 50, 14, 4);
    g.generateTexture('ground', 64, 64);
    g.clear();
    // Crate
    g.fillStyle(0x9b6b3d).fillRect(0, 0, 48, 48);
    g.lineStyle(4, 0x6e4a28).strokeRect(2, 2, 44, 44);
    g.lineBetween(4, 4, 44, 44).lineBetween(44, 4, 4, 44);
    g.generateTexture('crate', 48, 48);
    g.clear();
    // Dumpster
    g.fillStyle(0x2f6b45).fillRect(0, 8, 100, 52);
    g.fillStyle(0x24553a).fillRect(0, 0, 100, 12);
    g.fillStyle(0x1b3f2b).fillRect(10, 24, 80, 4).fillRect(10, 40, 80, 4);
    g.generateTexture('dumpster', 100, 60);
    g.clear();
    // Awnings (striped)
    [['awning_red', 0xc0392b], ['awning_green', 0x1e7a4a], ['awning_blue', 0x2f5fa8]].forEach(([key, col]) => {
      g.clear();
      for (let i = 0; i < 4; i++) {
        g.fillStyle(i % 2 ? 0xf3ece0 : col).fillRect(i * 16, 0, 16, 14);
      }
      g.fillStyle(0x000000, 0.25).fillRect(0, 14, 64, 4);
      g.generateTexture(key, 64, 18);
    });
    g.destroy();
  }

  buildTerrain() {
    const L = this.level;
    this.makeTextures();
    this.platforms = this.physics.add.staticGroup();
    this.oneWay = this.physics.add.staticGroup();

    // Ground with gaps
    const edges = [0, ...L.gaps.flat(), L.width];
    for (let i = 0; i < edges.length; i += 2) {
      const x0 = edges[i];
      const x1 = edges[i + 1];
      const seg = this.add.tileSprite(x0, this.groundY, x1 - x0, 70, 'ground').setOrigin(0, 0);
      this.platforms.add(seg);
    }

    const awningKeys = ['awning_red', 'awning_green', 'awning_blue'];
    L.awnings.forEach(([x, h, w], i) => {
      const a = this.add.tileSprite(x, this.groundY - h, w, 18, awningKeys[i % 3]).setOrigin(0, 0);
      this.oneWay.add(a);
      // little support poles for readability
      this.add.rectangle(x + 6, this.groundY - h + 18, 4, h - 18, 0x444444).setOrigin(0.5, 0).setDepth(-5);
      this.add.rectangle(x + w - 6, this.groundY - h + 18, 4, h - 18, 0x444444).setOrigin(0.5, 0).setDepth(-5);
    });

    L.crates.forEach(([x, count]) => {
      for (let i = 0; i < count; i++) {
        this.platforms.create(x, this.groundY - 24 - i * 48, 'crate');
      }
    });
    L.dumpsters.forEach(([x]) => {
      this.platforms.create(x, this.groundY - 30, 'dumpster');
    });
  }

  buildGoal() {
    const L = this.level;
    const x = L.goalX - 220;
    const w = 520;
    const h = 330;
    const g = this.add.graphics().setDepth(-6);
    g.fillStyle(0x1f3d2b).fillRect(x, this.groundY - h, w, h);
    g.fillStyle(0x16301f).fillRect(x, this.groundY - h, w, 14);
    g.fillStyle(0x0e1a12).fillRect(x + 30, this.groundY - 120, 160, 120);
    g.fillStyle(0xffc56b, 0.55).fillRect(x + 36, this.groundY - 114, 148, 70);
    g.fillStyle(0x0e1a12).fillRect(x + 330, this.groundY - 120, 160, 120);
    g.fillStyle(0xffc56b, 0.55).fillRect(x + 336, this.groundY - 114, 148, 70);
    // door
    g.fillStyle(0x5a3416).fillRect(L.goalX - 30, this.groundY - 130, 80, 130);
    g.fillStyle(0xffd27a).fillCircle(L.goalX + 36, this.groundY - 64, 4);
    this.add.text(x + w / 2, this.groundY - h + 60, "RALEIGH'S", {
      fontFamily: 'Georgia, serif', fontSize: '54px', fontStyle: 'bold', color: '#f2c14e',
      stroke: '#0e1a12', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(-5);
    this.add.text(x + w / 2, this.groundY - h + 108, 'PUB  •  TELEGRAPH AVE', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f2c14e',
    }).setOrigin(0.5).setDepth(-5);

    this.goal = this.add.zone(L.goalX + 10, this.groundY - 65, 80, 130);
    this.physics.add.existing(this.goal, true);
  }

  buildPickups() {
    const L = this.level;
    this.pickups = this.physics.add.group({ allowGravity: false, immovable: true });
    L.beers.forEach(([x, h]) => {
      const b = this.pickups.create(x, this.groundY - h, 'beer');
      b.kind = 'beer';
      this.tweens.add({ targets: b, y: b.y - 6, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
    });
    L.auraLines.forEach(([x, h, n]) => {
      for (let i = 0; i < n; i++) {
        const o = this.pickups.create(x + i * 36, this.groundY - h - 20, 'aura');
        o.kind = 'aura';
        this.tweens.add({ targets: o, scale: 1.2, yoyo: true, repeat: -1, duration: 500 + i * 40 });
      }
    });

    this.hazards = this.physics.add.staticGroup();
    L.djSets.forEach(([x, h]) => {
      const dj = this.hazards.create(x, this.groundY - h - 12, 'dj');
      dj.kind = 'dj';
      const notes = this.add.text(x, this.groundY - h - 50, '♪ ♫', { fontSize: '20px', color: '#ff2ad4' }).setOrigin(0.5);
      this.tweens.add({ targets: notes, y: notes.y - 10, alpha: 0.3, yoyo: true, repeat: -1, duration: 600 });
    });

    this.checkpoints = this.physics.add.staticGroup();
    L.checkpoints.forEach((x) => {
      this.add.rectangle(x, this.groundY - 50, 6, 100, 0x777777).setDepth(-4);
      const sign = this.add.text(x, this.groundY - 112, 'AURA\nTRACKER', {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', align: 'center',
        color: '#ffffff', backgroundColor: '#7d2cff', padding: { x: 6, y: 4 },
      }).setOrigin(0.5).setDepth(-4);
      const cp = this.add.zone(x, this.groundY - 60, 40, 120);
      this.physics.add.existing(cp, true);
      cp.sign = sign;
      this.checkpoints.add(cp);
    });
  }

  buildEnemies() {
    this.enemies = this.physics.add.group();
    this.level.enemies.forEach(([type, x]) => this.spawnEnemy(type, x));
  }

  spawnEnemy(type, x) {
    const cfg = ENEMY_TYPES[type];
    const e = this.enemies.create(x, this.groundY - 40, type);
    e.type = type;
    e.hp = cfg.hp;
    e.speed = cfg.speed;
    e.minX = x - cfg.range;
    e.maxX = x + cfg.range;
    e.dir = -1;
    e.hop = cfg.hop;
    e.nextHop = 0;
    e.stunnedUntil = 0;
    e.setCollideWorldBounds(true);
    e.body.setSize(e.width * 0.8, e.height * 0.9);
    return e;
  }

  // --------------------------------------------------------------- player --

  buildPlayer() {
    const id = this.charId;
    if (!this.anims.exists(`${id}_run`)) {
      this.anims.create({
        key: `${id}_run`,
        frames: [{ key: `${id}_run1` }, { key: `${id}_idle` }, { key: `${id}_run2` }, { key: `${id}_idle` }],
        frameRate: 12,
        repeat: -1,
      });
    }
    const p = this.physics.add.sprite(this.startX, this.groundY - 60, `${id}_idle`);
    p.body.setSize(30, 72).setOffset(9, 6);
    p.setCollideWorldBounds(true);
    p.setDepth(5);
    this.player = p;
    this.resetPlayerState();
  }

  resetPlayerState() {
    const p = this.player;
    p.hearts = MAX_HEARTS;
    p.dead = false;
    p.invincible = false;
    p.posing = false;
    p.dashing = false;
    p.redMode = false;
    p.lastShot = 0;
    p.attackUntil = 0;
    p.lastGrounded = 0;
    p.jumpBufferedAt = -1000;
    p.clearTint();
    p.setAlpha(1);
    p.body.allowGravity = true;
    p.displayName = this.char.name();
  }

  setupInput() {
    this.keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W',
      space: 'SPACE', attack: 'J', attack2: 'Z', super: 'K', super2: 'X',
    });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('SelectScene'));
  }

  setupCollisions() {
    const oneWayCheck = (obj, plat) => obj.body.velocity.y >= 0 && obj.body.bottom <= plat.body.top + 12;

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.oneWay, null, oneWayCheck);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.oneWay, null, oneWayCheck);

    this.projectiles = this.physics.add.group();
    this.physics.add.collider(this.projectiles, this.platforms, (proj) => {
      if (!proj.bounce) proj.destroy();
    });
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      this.damageEnemy(enemy, proj.damage);
      proj.destroy();
    });

    this.superHitters = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.superHitters, this.enemies, (hitter, enemy) => {
      hitter.hitSet = hitter.hitSet || new Set();
      if (hitter.hitSet.has(enemy)) return;
      hitter.hitSet.add(enemy);
      this.damageEnemy(enemy, hitter.damage);
    });

    this.physics.add.overlap(this.player, this.enemies, (p, enemy) => this.onTouchEnemy(enemy));
    this.physics.add.overlap(this.player, this.pickups, (p, item) => this.collect(item));
    this.physics.add.overlap(this.player, this.hazards, (p, hz) => this.onHazard(hz));
    this.physics.add.overlap(this.player, this.checkpoints, (p, cp) => this.onCheckpoint(cp));
    this.physics.add.overlap(this.player, this.goal, () => this.finishLevel());
  }

  spawnProjectile(p, key, { speed, damage, angle = 0, gravity = false, vy = 0, bounce = false }) {
    const dir = p.flipX ? -1 : 1;
    const proj = this.projectiles.create(p.x + dir * 26, p.y - 4, key);
    proj.damage = damage;
    proj.bounce = bounce;
    proj.body.allowGravity = gravity;
    proj.setVelocity(Math.cos(angle) * speed * dir, Math.sin(angle) * speed + vy);
    if (bounce) {
      proj.setBounce(1, 0.85);
      proj.body.setGravityY(-500);
    }
    proj.setFlipX(p.flipX);
    this.time.delayedCall(1600, () => proj.active && proj.destroy());
    return proj;
  }

  addSuperHitter(x, y, key, damage) {
    const obj = this.physics.add.image(x, y, key);
    this.superHitters.add(obj);
    obj.damage = damage;
    obj.setDepth(6);
    return obj;
  }

  update(time) {
    if (this.finished) return;
    this.updatePlayer(time);
    this.updateEnemies(time);
    this.updateHud();
  }

  updatePlayer(time) {
    const p = this.player;
    const k = this.keys;
    if (p.dead) return;

    if (p.y > 640) {
      this.killPlayer('Fell off Telegraph', 'Watch your step on Telegraph.');
      return;
    }

    const onGround = p.body.blocked.down || p.body.touching.down;
    if (onGround) p.lastGrounded = time;

    if (p.dashing) {
      this.enemies.getChildren().forEach((e) => {
        if (e.active && Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), e.getBounds())) {
          this.damageEnemy(e, 99);
        }
      });
      return;
    }
    if (p.posing) return;

    const left = k.left.isDown || k.a.isDown;
    const right = k.right.isDown || k.d.isDown;
    const jumpDown = k.up.isDown || k.w.isDown || k.space.isDown;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(k.up) || Phaser.Input.Keyboard.JustDown(k.w)
      || Phaser.Input.Keyboard.JustDown(k.space);

    const speed = this.char.speed;
    if (left) { p.setVelocityX(-speed); p.setFlipX(true); }
    else if (right) { p.setVelocityX(speed); p.setFlipX(false); }
    else p.setVelocityX(0);

    // Jump with a little forgiveness (coyote time + buffering).
    if (jumpPressed) p.jumpBufferedAt = time;
    if (time - p.jumpBufferedAt < 120 && time - p.lastGrounded < 100) {
      p.setVelocityY(-this.char.jump);
      p.jumpBufferedAt = -1000;
      p.lastGrounded = -1000;
    }
    if (!jumpDown && p.body.velocity.y < -200) p.setVelocityY(p.body.velocity.y * 0.85);

    // Attacks
    const attack = k.attack.isDown || k.attack2.isDown;
    const cooldown = this.char.normal.cooldown * (p.redMode ? 0.5 : 1);
    if (attack && time - p.lastShot > cooldown) {
      p.lastShot = time;
      p.attackUntil = time + 150;
      this.char.normal.fire(this, p);
    }
    if (Phaser.Input.Keyboard.JustDown(k.super) || Phaser.Input.Keyboard.JustDown(k.super2)) {
      if (this.aura >= AURA_MAX) {
        this.aura = 0;
        this.char.super.fire(this, p);
      } else {
        this.popText(p.x, p.y - 60, `need ${AURA_MAX - this.aura} more aura`, '#c9a8ff', 14);
      }
    }

    // Animation
    const id = this.charId;
    if (time < p.attackUntil) {
      p.anims.stop();
      p.setTexture(`${id}_attack`);
    } else if (!onGround) {
      p.anims.stop();
      p.setTexture(`${id}_jump`);
    } else if (left || right) {
      p.anims.play(`${id}_run`, true);
    } else {
      p.anims.stop();
      p.setTexture(`${id}_idle`);
    }
  }

  updateEnemies(time) {
    this.enemies.getChildren().forEach((e) => {
      if (!e.active || e.dying) return;
      if (e.y > 700) { e.destroy(); return; }
      if (time < e.stunnedUntil) { e.setVelocityX(0); return; }
      if (e.x <= e.minX || e.body.blocked.left) e.dir = 1;
      if (e.x >= e.maxX || e.body.blocked.right) e.dir = -1;
      e.setVelocityX(e.dir * e.speed);
      e.setFlipX(e.dir < 0);
      if (e.hop && e.body.blocked.down && time > e.nextHop) {
        e.setVelocityY(-380);
        e.nextHop = time + Phaser.Math.Between(900, 1800);
      }
    });
  }

  // --------------------------------------------------------- interactions --

  enemiesOnScreen() {
    const view = this.cameras.main.worldView;
    return this.enemies.getChildren().filter((e) => e.active && !e.dying && view.contains(e.x, e.y));
  }

  stunEnemy(enemy, ms) {
    enemy.stunnedUntil = this.time.now + ms;
    enemy.setTint(0x9ad0ff);
    this.time.delayedCall(ms, () => enemy.active && !enemy.dying && enemy.clearTint());
  }

  damageEnemy(enemy, dmg) {
    if (!enemy.active || enemy.dying) return;
    enemy.hp -= dmg;
    if (enemy.hp > 0) {
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(80, () => enemy.active && enemy.clearTint());
      return;
    }
    enemy.dying = true;
    enemy.body.enable = false;
    this.addAura(KILL_AURA, enemy.x, enemy.y - 30);
    this.tweens.add({
      targets: enemy, angle: 180, y: enemy.y - 40, alpha: 0, duration: 400,
      onComplete: () => enemy.destroy(),
    });
  }

  onTouchEnemy(enemy) {
    const p = this.player;
    if (p.dead || enemy.dying) return;
    // Stomp from above, Mario style.
    if (p.body.velocity.y > 50 && p.body.bottom < enemy.body.top + 18) {
      this.damageEnemy(enemy, 99);
      p.setVelocityY(-420);
      return;
    }
    if (p.invincible || p.dashing) return;
    this.hurtPlayer(enemy.x < p.x ? 1 : -1);
  }

  hurtPlayer(knockDir) {
    const p = this.player;
    p.hearts -= 1;
    if (p.hearts <= 0) {
      this.killPlayer('Brainrotted', 'Too much brainrot.');
      return;
    }
    p.invincible = true;
    p.setVelocity(knockDir * 260, -300);
    this.cameras.main.shake(120, 0.006);
    this.tweens.add({ targets: p, alpha: 0.3, yoyo: true, repeat: 6, duration: 90, onComplete: () => p.setAlpha(1) });
    this.time.delayedCall(1300, () => { p.invincible = false; });
  }

  collect(item) {
    if (!item.active) return;
    if (item.kind === 'beer') {
      this.addAura(BEER_AURA, item.x, item.y - 20, '🍺');
      if (this.charId === 'airbus') {
        // He turns red when he drinks.
        this.player.setTint(0xff7070);
        this.time.delayedCall(1500, () => !this.player.redMode && this.player.clearTint());
      }
    } else {
      this.addAura(ORB_AURA, item.x, item.y - 16);
    }
    item.destroy();
  }

  onHazard(hz) {
    const trigger = this.char.deathTriggers?.[hz.kind];
    if (trigger && !this.player.dead) {
      this.funkDeath(trigger, hz);
    }
  }

  funkDeath(trigger, hz) {
    const p = this.player;
    p.dead = true;
    p.setVelocity(0, 0);
    p.body.allowGravity = false;
    p.anims.stop();
    p.setPosition(hz.x, hz.y - 50);
    const colors = [0xff2ad4, 0x2ad4ff, 0xfff22a, 0x2aff7a];
    let i = 0;
    const disco = this.time.addEvent({ delay: 90, repeat: 20, callback: () => p.setTint(colors[i++ % colors.length]) });
    const t = this.add.text(p.x, p.y - 90, trigger.title, {
      fontFamily: 'Impact, sans-serif', fontSize: '56px', color: '#ff2ad4', stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, angle: { from: -8, to: 8 }, yoyo: true, repeat: 5, duration: 160 });
    this.tweens.add({ targets: p, angle: 360, duration: 1800, onComplete: () => p.setAngle(0) });
    this.time.delayedCall(1900, () => {
      disco.remove();
      t.destroy();
      this.killPlayer(trigger.title, trigger.caption, true);
    });
  }

  onCheckpoint(cp) {
    if (cp.reached) return;
    cp.reached = true;
    this.respawnX = cp.x;
    cp.sign.setBackgroundColor('#2ad46a');
    this.popText(cp.x, cp.y - 100, 'Checkpoint saved at 15h15', '#7dffb0', 18);
  }

  killPlayer(title, caption, alreadyAnimated = false) {
    const p = this.player;
    if (p.dead && !alreadyAnimated) return;
    p.dead = true;
    this.deaths += 1;
    p.setVelocity(0, 0);
    p.body.allowGravity = false;
    p.anims.stop();
    if (!alreadyAnimated) {
      p.setTint(0x888888);
      this.tweens.add({ targets: p, angle: 90, duration: 300 });
    }

    const cam = this.cameras.main;
    const box = this.add.container(480, 230).setScrollFactor(0).setDepth(50);
    box.add(this.add.rectangle(0, 0, 640, 150, 0x000000, 0.75));
    box.add(this.add.text(0, -30, `RIP ${p.displayName}`, {
      fontFamily: 'Impact, sans-serif', fontSize: '42px', color: '#ff5a5a',
    }).setOrigin(0.5));
    box.add(this.add.text(0, 24, caption, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 600 },
    }).setOrigin(0.5));

    this.time.delayedCall(2000, () => {
      box.destroy();
      cam.flash(200, 255, 255, 255);
      p.setPosition(this.respawnX, this.groundY - 80);
      p.setAngle(0);
      this.resetPlayerState();
      p.invincible = true;
      this.time.delayedCall(1200, () => { p.invincible = false; });
      if (this.charId === 'ricky') {
        this.popText(p.x, p.y - 80, `Now playing as: ${p.displayName}`, '#e8cf7a', 18);
      }
    });
  }

  addAura(n, x, y, emoji = '') {
    const before = this.score;
    this.score += n;
    const wasFull = this.aura >= AURA_MAX;
    this.aura = Math.min(AURA_MAX, this.aura + n);
    this.popText(x, y, `+${n} aura ${emoji}`, '#d9b8ff', 16);
    if (!this.shown67 && before < 67 && this.score >= 67) {
      this.shown67 = true;
      this.bigPop('6-7!');
    }
    if (!wasFull && this.aura >= AURA_MAX) {
      this.popText(this.player.x, this.player.y - 100, 'SUPER READY [K]', '#ffe14d', 22);
    }
  }

  finishLevel() {
    if (this.finished) return;
    this.finished = true;
    const p = this.player;
    p.setVelocity(0, 0);
    p.anims.stop();
    p.setTexture(`${this.charId}_idle`);
    this.physics.pause();

    const box = this.add.container(480, 270).setScrollFactor(0).setDepth(60);
    box.add(this.add.rectangle(0, 0, 680, 330, 0x0e1a12, 0.92).setStrokeStyle(4, 0xf2c14e));
    box.add(this.add.text(0, -120, 'LEVEL CLEAR', {
      fontFamily: 'Impact, sans-serif', fontSize: '52px', color: '#f2c14e',
    }).setOrigin(0.5));
    box.add(this.add.text(0, -60, `${p.displayName} made it to Raleigh's. First round's on you.`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 620 },
    }).setOrigin(0.5));
    box.add(this.add.text(0, 10, `Aura: ${this.score}     Deaths: ${this.deaths}`, {
      fontFamily: 'monospace', fontSize: '22px', color: '#d9b8ff',
    }).setOrigin(0.5));
    box.add(this.add.text(0, 100, 'ENTER: play again     ESC: choose character', {
      fontFamily: 'monospace', fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart({ character: this.charId }));
  }

  // ------------------------------------------------------------------ HUD --

  buildHud() {
    const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(40);
    this.hud = hud;
    hud.add(this.add.rectangle(0, 0, 960, 56, 0x000000, 0.45).setOrigin(0, 0));
    this.hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
      const h = this.add.image(24 + i * 28, 18, 'heart').setOrigin(0, 0);
      this.hearts.push(h);
      hud.add(h);
    }
    this.nameText = this.add.text(24, 2, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffffff' });
    hud.add(this.nameText);

    hud.add(this.add.text(150, 10, 'AURA', { fontFamily: 'monospace', fontSize: '14px', color: '#d9b8ff', fontStyle: 'bold' }));
    hud.add(this.add.rectangle(200, 12, 220, 18, 0x22152f).setOrigin(0, 0).setStrokeStyle(2, 0xb46bff));
    this.auraBar = this.add.rectangle(202, 14, 0, 14, 0xb46bff).setOrigin(0, 0);
    hud.add(this.auraBar);
    this.auraText = this.add.text(310, 21, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
    hud.add(this.auraText);
    this.superHint = this.add.text(200, 34, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe14d' });
    hud.add(this.superHint);

    this.scoreText = this.add.text(560, 10, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' });
    hud.add(this.scoreText);
    this.deathText = this.add.text(560, 32, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffaaaa' });
    hud.add(this.deathText);
    hud.add(this.add.text(940, 12, '15h15', { fontFamily: 'monospace', fontSize: '22px', color: '#7dffb0', fontStyle: 'bold' }).setOrigin(1, 0));
    hud.add(this.add.text(940, 38, 'J attack · K super · ESC menu', { fontFamily: 'monospace', fontSize: '10px', color: '#cccccc' }).setOrigin(1, 0));
  }

  updateHud() {
    const p = this.player;
    this.hearts.forEach((h, i) => h.setTexture(i < p.hearts ? 'heart' : 'heartEmpty'));
    this.nameText.setText(p.displayName);
    this.auraBar.width = 216 * (this.aura / AURA_MAX);
    this.auraBar.fillColor = this.aura >= AURA_MAX ? 0xffe14d : 0xb46bff;
    this.auraText.setText(`${this.aura}/${AURA_MAX}`);
    this.superHint.setText(this.aura >= AURA_MAX ? `★ ${this.char.super.name} READY — press K` : `super: ${this.char.super.name}`);
    this.scoreText.setText(`Total aura: ${this.score}`);
    this.deathText.setText(`Deaths: ${this.deaths}`);
  }

  popText(x, y, text, color = '#ffffff', size = 16) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1100, delay: 300, onComplete: () => t.destroy() });
  }

  bigPop(text) {
    const t = this.add.text(480, 220, text, {
      fontFamily: 'Impact, sans-serif', fontSize: '96px', color: '#ffe14d', stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(45).setScale(0.2);
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 1000, duration: 400, onComplete: () => t.destroy() });
  }

  banner(title, subtitle) {
    const c = this.add.container(480, 200).setScrollFactor(0).setDepth(45);
    c.add(this.add.text(0, 0, title, {
      fontFamily: 'Impact, sans-serif', fontSize: '60px', color: '#ffffff', stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5));
    c.add(this.add.text(0, 50, subtitle, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffe14d', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5));
    this.tweens.add({ targets: c, alpha: 0, delay: 1800, duration: 600, onComplete: () => c.destroy() });
  }
}
