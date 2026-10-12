import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { LevelScene } from './scenes/LevelScene.js';

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#003262',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1200 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, SelectScene, LevelScene],
});

// Dev only: show runtime errors on the page.
if (import.meta.env.DEV) {
  const show = (msg) => {
    let el = document.getElementById('dev-errors');
    if (!el) {
      el = document.createElement('pre');
      el.id = 'dev-errors';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;margin:0;padding:8px;background:#900;color:#fff;font:12px monospace;z-index:9;white-space:pre-wrap';
      document.body.appendChild(el);
    }
    el.textContent += `${msg}\n`;
  };
  window.addEventListener('error', (e) => show(`${e.message} @ ${e.filename}:${e.lineno}`));
  window.addEventListener('unhandledrejection', (e) => show(String(e.reason)));
}
