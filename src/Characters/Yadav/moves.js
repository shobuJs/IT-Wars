// Mid-range bruiser.
export default {
  punch:      { startup: 0.08, active: 0.06, recovery: 0.17, dmg: 5,  hitstun: 0.26, blockstun: 0.14, knockback: 90,  hitbox: { ox: 43, oy: 16, w: 38, h: 20 }, chain: true },
  kick:       { startup: 0.10, active: 0.07, recovery: 0.20, dmg: 6,  hitstun: 0.28, blockstun: 0.15, knockback: 110, hitbox: { ox: 47, oy: 46, w: 42, h: 20 }, chain: true },
  heavyPunch: { startup: 0.22, active: 0.08, recovery: 0.37, dmg: 13, hitstun: 0.45, blockstun: 0.22, knockback: 300, knockdown: true, hitbox: { ox: 50, oy: 14, w: 50, h: 26 } },
  heavyKick:  { startup: 0.25, active: 0.09, recovery: 0.41, dmg: 14, hitstun: 0.50, blockstun: 0.24, knockback: 330, launch: 430,     hitbox: { ox: 52, oy: 38, w: 52, h: 30 } },
  air:        { startup: 0.10, active: 0.12, recovery: 0.15, dmg: 8,  hitstun: 0.30, blockstun: 0.15, knockback: 150, hitbox: { ox: 38, oy: 50, w: 42, h: 28 } },
};
