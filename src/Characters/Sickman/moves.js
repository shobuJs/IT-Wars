// Fast, fragile rushdown: quickest buttons in the game, shortest reach.
// Lights are minus-on-block so blocking punishes button-mashing.
export default {
  punch:      { startup: 0.05, active: 0.05, recovery: 0.13, dmg: 4,  hitstun: 0.24, blockstun: 0.11, knockback: 80,  hitbox: { ox: 38, oy: 16, w: 34, h: 20 }, chain: true },
  kick:       { startup: 0.07, active: 0.06, recovery: 0.16, dmg: 5,  hitstun: 0.26, blockstun: 0.12, knockback: 100, hitbox: { ox: 42, oy: 46, w: 38, h: 20 }, chain: true },
  heavyPunch: { startup: 0.15, active: 0.07, recovery: 0.27, dmg: 9,  hitstun: 0.42, blockstun: 0.20, knockback: 270, knockdown: true, hitbox: { ox: 40, oy: 14, w: 42, h: 26 } },
  heavyKick:  { startup: 0.18, active: 0.08, recovery: 0.31, dmg: 10, hitstun: 0.46, blockstun: 0.22, knockback: 300, launch: 420,     hitbox: { ox: 44, oy: 38, w: 46, h: 30 } },
  air:        { startup: 0.08, active: 0.12, recovery: 0.13, dmg: 6,  hitstun: 0.28, blockstun: 0.14, knockback: 140, hitbox: { ox: 36, oy: 50, w: 40, h: 28 } },
};
