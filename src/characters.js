import Phaser from 'phaser';

// Each character: stats, a normal attack (unlimited, cooldown) and a super
// (costs a full aura meter). `level` is the running LevelScene, `p` the player sprite.

const RICKY_NAMES = ['Ricky Rick', 'Rizzly the Brick', 'Bricky Brick', 'Rizzly Rick'];

export const CHARACTERS = {
  airbus: {
    id: 'airbus',
    name: () => 'Airbus',
    tagline: 'Throws planes. Turns red when he drinks.',
    speed: 260,
    jump: 640,
    normal: {
      name: 'Paper Plane',
      cooldown: 280,
      fire(level, p) {
        const angles = p.redMode ? [-0.18, 0, 0.18] : [0];
        angles.forEach((a) => {
          const plane = level.spawnProjectile(p, 'plane', { speed: 560, damage: 1, angle: a });
          plane.setRotation(p.flipX ? Math.PI - a : a);
          plane.setFlipX(false);
        });
      },
    },
    super: {
      name: 'Red Mode',
      fire(level, p) {
        level.popText(p.x, p.y - 70, 'RED MODE 🍺', '#ff3b3b', 30);
        p.redMode = true;
        p.setTint(0xff5a5a);
        level.time.delayedCall(7000, () => {
          p.redMode = false;
          p.clearTint();
        });
        // A squadron of planes sweeps the whole screen.
        const cam = level.cameras.main;
        for (let i = 0; i < 8; i++) {
          level.time.delayedCall(i * 140, () => {
            const y = cam.scrollY + 100 + i * 50;
            const plane = level.addSuperHitter(cam.scrollX - 80, y, 'bigplane', 99);
            plane.setVelocityX(1100);
            level.time.delayedCall(1600, () => plane.destroy());
          });
        }
      },
    },
  },

  ricky: {
    id: 'ricky',
    name: () => Phaser.Utils.Array.GetRandom(RICKY_NAMES),
    tagline: 'Throws bricks. Nobody knows his real name.',
    speed: 235,
    jump: 620,
    normal: {
      name: 'Brick',
      cooldown: 420,
      fire(level, p) {
        const brick = level.spawnProjectile(p, 'brick', { speed: 380, damage: 2, gravity: true, vy: -380 });
        brick.setAngularVelocity(p.flipX ? -540 : 540);
      },
    },
    super: {
      name: 'IDK Shrug',
      fire(level, p) {
        p.posing = true;
        p.setTexture('ricky_super');
        p.setVelocityX(0);
        level.popText(p.x, p.y - 80, '¯\\_(ツ)_/¯', '#ffffff', 32);
        const ring = level.add.circle(p.x, p.y, 10).setStrokeStyle(6, 0xe8cf7a);
        level.tweens.add({
          targets: ring, radius: 600, alpha: 0, duration: 700,
          onComplete: () => ring.destroy(),
        });
        // Everything on screen is stunned, then a brick falls on each one.
        level.enemiesOnScreen().forEach((enemy, i) => {
          level.stunEnemy(enemy, 2500);
          level.time.delayedCall(300 + i * 90, () => {
            if (!enemy.active) return;
            const brick = level.addSuperHitter(enemy.x, level.cameras.main.scrollY - 30, 'brick', 3);
            brick.setScale(1.6).setAngularVelocity(400).setVelocityY(900);
            level.time.delayedCall(1500, () => brick.destroy());
          });
        });
        level.time.delayedCall(700, () => { p.posing = false; });
      },
    },
  },

  guy: {
    id: 'guy',
    name: () => 'Guy',
    tagline: 'Burnt hand = fireballs. Runs through glass doors.',
    speed: 285,
    jump: 640,
    // Touching any object in this list kills him instantly.
    deathTriggers: {
      dj: { title: 'GUY FUNK', caption: 'Guy touched the decks. Guy is now Guy Funk. Guy is no more.' },
    },
    normal: {
      name: 'Fireball',
      cooldown: 320,
      fire(level, p) {
        const fb = level.spawnProjectile(p, 'fireball', { speed: 430, damage: 1, gravity: true, vy: -150, bounce: true });
        fb.setAngularVelocity(720);
      },
    },
    super: {
      name: 'Glass Door',
      fire(level, p) {
        const dir = p.flipX ? -1 : 1;
        p.posing = true;
        p.invincible = true;
        p.setVelocity(0, 0);
        p.body.allowGravity = false;
        const pane = level.add.image(p.x + dir * 70, p.y - 6, 'glass').setScale(1.4).setDepth(6);
        level.popText(p.x, p.y - 80, 'GLASS DOOR', '#bfe9ff', 28);

        level.time.delayedCall(350, () => {
          p.dashing = true;
          p.setVelocityX(dir * 950);
          level.time.delayedCall(80, () => {
            // Smash: shards fly forward and hurt anything they touch.
            for (let i = 0; i < 12; i++) {
              const s = level.addSuperHitter(pane.x, pane.y + Phaser.Math.Between(-35, 35), 'shard', 2);
              s.setVelocity(dir * Phaser.Math.Between(350, 750), Phaser.Math.Between(-300, 100));
              s.setAngularVelocity(Phaser.Math.Between(-600, 600));
              level.time.delayedCall(900, () => s.destroy());
            }
            level.cameras.main.shake(150, 0.01);
            pane.destroy();
          });
          level.time.delayedCall(450, () => {
            p.dashing = false;
            p.posing = false;
            p.body.allowGravity = true;
            p.setVelocity(0, -380); // little hop so a dash over a pit is recoverable
            level.time.delayedCall(300, () => { p.invincible = false; });
          });
        });
      },
    },
  },
};

export const CHARACTER_ORDER = ['airbus', 'ricky', 'guy'];
