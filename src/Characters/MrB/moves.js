// Zoner: weak normals, wins at range with coffee.
export default {
  punch:      { startup: 0.08, active: 0.06, recovery: 0.17, dmg: 4,  hitstun: 0.25, blockstun: 0.13, knockback: 85,  hitbox: { ox: 41, oy: 16, w: 36, h: 20 }, chain: true },
  kick:       { startup: 0.10, active: 0.07, recovery: 0.20, dmg: 5,  hitstun: 0.27, blockstun: 0.14, knockback: 105, hitbox: { ox: 45, oy: 46, w: 40, h: 20 }, chain: true },
  heavyPunch: { startup: 0.21, active: 0.08, recovery: 0.35, dmg: 10, hitstun: 0.44, blockstun: 0.21, knockback: 290, knockdown: true, hitbox: { ox: 45, oy: 14, w: 46, h: 26 } },
  heavyKick:  { startup: 0.24, active: 0.09, recovery: 0.40, dmg: 11, hitstun: 0.48, blockstun: 0.23, knockback: 320, launch: 425,     hitbox: { ox: 48, oy: 38, w: 48, h: 30 } },
  air:        { startup: 0.10, active: 0.12, recovery: 0.15, dmg: 6,  hitstun: 0.28, blockstun: 0.14, knockback: 140, hitbox: { ox: 37, oy: 50, w: 40, h: 28 } },
};
