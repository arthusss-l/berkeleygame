// Level 1: Telegraph Ave. All y values are offsets above the ground line.

export const TELEGRAPH = {
  key: 'telegraph',
  title: 'Telegraph Ave',
  subtitle: 'Next round at Raleigh\'s',
  width: 7000,
  groundY: 470,
  sky: [0x2b2d6e, 0xe9887a], // dusk over Berkeley
  gaps: [[1500, 1640], [2700, 2860], [4100, 4260], [5300, 5480]],
  // [x, height above ground, width] — you can jump up through these
  awnings: [
    [600, 130, 160], [1150, 140, 180], [1540, 175, 120], [1900, 130, 160],
    [2380, 140, 200], [2740, 180, 140], [3050, 130, 160], [3560, 250, 140],
    [3880, 140, 160], [4140, 185, 140], [4600, 130, 180], [4980, 230, 150],
    [5330, 180, 160], [5800, 140, 180], [6200, 130, 160],
  ],
  crates: [[1000, 1], [1048, 2], [3400, 1], [5150, 2], [5198, 1]],
  dumpsters: [[2150], [4720], [6050]],
  enemies: [
    ['tung', 820], ['tung', 1320], ['shark', 1850], ['tung', 2050], ['tung', 2520],
    ['shark', 3000], ['tung', 3520], ['shark', 3820], ['tung', 4000], ['shark', 4450],
    ['tung', 4900], ['shark', 5100], ['tung', 5650], ['shark', 5950], ['tung', 6350],
  ],
  beers: [[680, 175], [1230, 185], [2480, 185], [3630, 295], [5050, 275], [6280, 175], [2950, 70]],
  auraLines: [[300, 40, 5], [1100, 40, 4], [1560, 220, 3], [2200, 120, 4], [3100, 175, 4], [4300, 40, 6], [5850, 185, 4]],
  djSets: [[3330, 0], [4980, 230 + 0]],
  checkpoints: [3250],
  goalX: 6780,
  shops: ['BOBA', 'PIZZA', 'TACOS', 'BOOKS', 'RECORDS', 'PHO', 'TAP HAUS', 'SMOKE SHOP', 'TRADER JOE\'S', 'BURRITOS', 'TATTOO'],
};
