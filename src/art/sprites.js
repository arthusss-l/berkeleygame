// All pixel art is defined here as text grids and turned into textures at boot.
// One character per pixel; '.' is transparent. Each grid uses its own palette.

export const SCALE = 3;

// ---------------------------------------------------------------------------
// Characters: 16 x 26 grid = head (rows 0-12), neck (13), torso (14-19),
// pants/legs (20-25). Arms are drawn per pose on top.
// ---------------------------------------------------------------------------

const CHARACTER_ART = {
  airbus: {
    palette: {
      h: '#2b1d16', H: '#140d0a', s: '#f0c4a4', S: '#d9a283', e: '#2a1a12',
      m: '#7a5440', k: '#8a4a3c', t: '#f4f6fa', T: '#c9d3e3', b: '#1f4fa8',
      p: '#2c3446', f: '#f4f6fa',
    },
    sleeve: 2, // rows of sleeve before skin
    head: [
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhhhhhhhhhhh..',
      '..hhhHhhhhHhhhh.',
      '..hhhhhhhhhhhhh.',
      '..hshhhhhsssshh.',
      '..ssssssssssss..',
      '..sssessssesss..',
      '..sssessssesss..',
      '..ssssssSsssss..',
      '..sssmmmmmmsss..',
      '...sssskksssss..',
      '....ssssssss....',
    ],
    torso: [
      '...tttttttttT...',
      '...tttttttttT...',
      '...bbbbbbbbbb...',
      '...tttttttttT...',
      '...tttttttttT...',
      '...tttttttttT...',
    ],
  },
  ricky: {
    palette: {
      h: '#e8cf7a', H: '#c4a552', s: '#f3cdb0', S: '#dcae90', k: '#111111',
      w: '#e8f0ff', t: '#1b1b1f', T: '#000000', l: '#d8d8d8', p: '#4a4a52',
      f: '#111111', m: '#b86e6e',
    },
    sleeve: 2,
    head: [
      '................',
      '....hhhhhhhh....',
      '..hhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhh.',
      '.hhhHhhhhhhHhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhsssssssssshh.',
      '.hskwkkkkwkkksh.',
      '.hskkkksskkkksh.',
      '.hssssssSsssssh.',
      '..sssssmmssss...',
      '....ssssssss....',
    ],
    torso: [
      '...tttttttttt...',
      '...tttttttttt...',
      '...ttlllttttt...',
      '...ttlllttttt...',
      '...tttttttttt...',
      '...tttttttttt...',
    ],
  },
  guy: {
    palette: {
      h: '#9a7148', H: '#6e4e30', s: '#f2c9a6', S: '#d8a684', k: '#1a1410',
      e: '#2a1a12', g: '#c9dbe6', t: '#d81e1e', T: '#a51212', c: '#111111',
      d: '#22222a', y: '#ffcc22', o: '#ff8a1c', p: '#7d9cc4', f: '#5a3a22',
      m: '#9c5a4a',
    },
    sleeve: 5, // jacket = long sleeves
    head: [
      '................',
      '.....hhhhhh.....',
      '...hhhhhhhhhh...',
      '..hhhHhhhhhhhh..',
      '..hhhhhhHhhhhh..',
      '..hssssssssssh..',
      '..ssssssssssss..',
      '..skkkkkkkkkks..',
      '..skegksskegks..',
      '..skggksskggks..',
      '..skkkksskkkks..',
      '...ssssssmmss...',
      '....ssssssss....',
    ],
    torso: [
      '...ccccddcccc...',
      '...ttttddtttT...',
      '...tyytddtttT...',
      '...tyytddtttT...',
      '...ttttddtttT...',
      '...ttttddtttT...',
    ],
  },
};

const LEGS = {
  stand: [
    '...pppppppppp...',
    '...pppp..pppp...',
    '...pppp..pppp...',
    '...pppp..pppp...',
    '...ffff..ffff...',
    '..fffff..fffff..',
  ],
  run1: [
    '...pppppppppp...',
    '..pppp....pppp..',
    '.pppp......pppp.',
    '.ppp........ppp.',
    'ffff........fff.',
    'fff..........ff.',
  ],
  run2: [
    '...pppppppppp...',
    '....pppppppp....',
    '.....pppppp.....',
    '.....pppppp.....',
    '.....ffffff.....',
    '....fffffff.....',
  ],
  jump: [
    '...pppppppppp...',
    '...pppp..pppp...',
    '..pppp....pppp..',
    '..ffff....ffff..',
    '................',
    '................',
  ],
};

// Arms: list of [col, row, 'sleeve'|'skin'] for a given pose.
function armPixels(pose, sleeve) {
  const px = [];
  const vertical = (cols, top, bottom) => {
    for (let r = top; r <= bottom; r++) {
      cols.forEach((c) => px.push([c, r, r - top < sleeve ? 'sleeve' : 'skin']));
    }
  };
  if (pose === 'down' || pose === 'attack') {
    vertical([1, 2], 14, 19);
    if (pose === 'down') vertical([13, 14], 14, 19);
    else {
      // Right arm thrown forward, horizontal.
      [13, 14].forEach((c) => [15, 16].forEach((r) => px.push([c, r, 'sleeve'])));
      [15].forEach((c) => [15, 16].forEach((r) => px.push([c, r, 'skin'])));
    }
  } else if (pose === 'up') {
    // Both arms raised (jumping).
    [[1, 2], [13, 14]].forEach((cols) => {
      for (let r = 9; r <= 15; r++) {
        cols.forEach((c) => px.push([c, r, r >= 15 - Math.min(sleeve, 3) ? 'sleeve' : 'skin']));
      }
    });
  } else if (pose === 'shrug') {
    // The "idk" shrug: elbows out, palms up.
    [[1, 2, 0], [13, 14, 15]].forEach(([a, b, out]) => {
      [14, 15, 16].forEach((r) => [a, b].forEach((c) => px.push([c, r, 'sleeve'])));
      [12, 13].forEach((r) => px.push([out, r, 'skin']));
      px.push([out === 0 ? 1 : 14, 13, 'skin']);
      px.push([out, 11, 'skin']);
      px.push([out === 0 ? 1 : 14, 11, 'skin']);
    });
  }
  return px;
}

function buildCharacterGrid(art, legs, pose) {
  const blank = '.'.repeat(16);
  const grid = [
    ...art.head,
    '......ssss......',
    ...art.torso,
    ...LEGS[legs],
  ].map((row) => row.split(''));
  while (grid.length < 26) grid.push(blank.split(''));

  for (const [c, r, kind] of armPixels(pose, art.sleeve)) {
    grid[r][c] = kind === 'sleeve' ? 't' : 's';
  }
  return grid.map((row) => row.join(''));
}

export const CHARACTER_FRAMES = {
  idle: ['stand', 'down'],
  run1: ['run1', 'down'],
  run2: ['run2', 'down'],
  jump: ['jump', 'up'],
  attack: ['stand', 'attack'],
  super: ['stand', 'shrug'],
};

// ---------------------------------------------------------------------------
// Enemies & props
// ---------------------------------------------------------------------------

const PROPS = {
  // Tung Tung Tung Sahur-style log with a bat.
  tung: {
    palette: { n: '#b07a45', N: '#8a5a2e', w: '#ffffff', k: '#111111', B: '#5b3a1e', r: '#c0392b' },
    rows: [
      '...nnnnnn..B',
      '..nnnnnnnnBB',
      '..nwwnnwwnB.',
      '..nwknnwknB.',
      '..nnnnnnnnB.',
      '..nnkkkknnB.',
      '..nnkrrknn..',
      '..nnnnnnnn..',
      '..nNnnnnNn..',
      '..nnnnnnnn..',
      '..nnNnnNnn..',
      '..nnnnnnnn..',
      '...n....n...',
      '..kk....kk..',
    ],
  },
  // Tralalero Tralala-style shark in sneakers.
  shark: {
    palette: { u: '#3d8bd4', U: '#2a6aa8', w: '#ffffff', k: '#111111', b: '#1f4fa8', r: '#e74c3c' },
    rows: [
      '.......u......',
      '......uu......',
      'u..uuuuuuuu...',
      'uuuuuuuuuuuuk.',
      'uuuUuuuuuuuuuu',
      'u..wwwwwwwrrr.',
      '...wwwwwwwww..',
      '....w..w..w...',
      '...bb.bb.bb...',
    ],
  },
  plane: {
    palette: { w: '#ffffff', g: '#b8c4d6' },
    rows: [
      'ww......',
      'wwwww...',
      'gwwwwwww',
      'wwwww...',
      'ww......',
    ],
  },
  bigplane: {
    palette: { w: '#ffffff', g: '#b8c4d6', b: '#1f4fa8', k: '#22324a', r: '#d81e1e' },
    rows: [
      '.....ww.............',
      '.....www............',
      'r....wwww...........',
      'rr...wwwwww.........',
      'wwwwwwwwwwwwwwwwww..',
      'bbbbbbbbbbbbbbbbbkkw',
      'wwwwwwwwwwwwwwwwwww.',
      '..ggg..wwwww........',
      '.......wwww.........',
      '.......www..........',
    ],
  },
  brick: {
    palette: { r: '#b5462f', R: '#8c3020', m: '#d8c8b0' },
    rows: [
      'rrrmrrrr',
      'RRRmRRRR',
      'mmmmmmmm',
      'rmrrrrmr',
      'RmRRRRmR',
    ],
  },
  fireball: {
    palette: { y: '#fff27a', o: '#ff9a1f', r: '#e8331c' },
    rows: [
      '..rr..',
      '.rooo.',
      'royyor',
      'royyor',
      '.rooo.',
      '..rr..',
    ],
  },
  glass: {
    palette: { g: '#cfefff', G: '#9fd6f2', w: '#ffffff', k: '#5e7f92' },
    rows: Array.from({ length: 28 }, (_, i) =>
      i === 0 || i === 27 ? 'kkkkkk' : i % 7 === 2 ? 'kwgggk' : 'kgGggk'),
  },
  shard: {
    palette: { g: '#cfefff', w: '#ffffff' },
    rows: ['.w.', 'wgg', '.g.'],
  },
  beer: {
    palette: { w: '#ffffff', y: '#f2b41b', Y: '#d18d0b', g: '#d9e8f0' },
    rows: [
      '.wwww.',
      'wwwwww',
      'gyyyyg',
      'gyYyyg',
      'gyyyyg',
      'gyyYyg',
      'gyyyyg',
      'gyyyyg',
      '.gggg.',
    ],
  },
  aura: {
    palette: { p: '#b46bff', P: '#7d2cff', w: '#ffffff' },
    rows: [
      '..pp..',
      '.pwpp.',
      'ppwppP',
      'pppppP',
      '.pPPP.',
      '..PP..',
    ],
  },
  dj: {
    palette: { k: '#1a1a22', g: '#555566', c: '#2ad4ff', m: '#ff2ad4', s: '#999aaa', w: '#ffffff' },
    rows: [
      '.....s......s.......',
      '......s....s........',
      'kkkkkkkkkkkkkkkkkkkk',
      'kgggkkkcmckmckkkgggk',
      'kgwgkkkkkkkkkkkkgwgk',
      'kgggkkcmcmcmcmckgggk',
      'kkkkkkkkkkkkkkkkkkkk',
      '.kk..............kk.',
    ],
  },
  heart: {
    palette: { r: '#e8333c', w: '#ffb3b8', k: '#5a0d12' },
    rows: [
      '.rr.rr.',
      'rwrrrrr',
      'rrrrrrr',
      '.rrrrr.',
      '..rrr..',
      '...r...',
    ],
  },
  heartEmpty: {
    palette: { k: '#5a3a3e' },
    rows: [
      '.kk.kk.',
      'k..k..k',
      'k.....k',
      '.k...k.',
      '..k.k..',
      '...k...',
    ],
  },
};

function drawGrid(scene, key, rows, palette, scale = SCALE) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w * scale, h * scale);
  const ctx = tex.getContext();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !palette[ch]) return;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  tex.refresh();
}

export function generateAllTextures(scene) {
  for (const [id, art] of Object.entries(CHARACTER_ART)) {
    for (const [frame, [legs, pose]] of Object.entries(CHARACTER_FRAMES)) {
      drawGrid(scene, `${id}_${frame}`, buildCharacterGrid(art, legs, pose), art.palette);
    }
  }
  for (const [key, { rows, palette }] of Object.entries(PROPS)) {
    drawGrid(scene, key, rows, palette);
  }
  // Big portrait versions for the select screen.
  for (const [id, art] of Object.entries(CHARACTER_ART)) {
    drawGrid(scene, `${id}_portrait`, buildCharacterGrid(art, 'stand', 'down'), art.palette, 6);
    drawGrid(scene, `${id}_portrait_super`, buildCharacterGrid(art, 'stand', id === 'ricky' ? 'shrug' : 'attack'), art.palette, 6);
  }
}
