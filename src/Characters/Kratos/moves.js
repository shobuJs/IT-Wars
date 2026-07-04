// Slow tank: big reach, big damage, punishable on whiff.
export default {
  punch:      { startup: 0.10, active: 0.06, recovery: 0.20, dmg: 6,  hitstun: 0.26, blockstun: 0.14, knockback: 90,  hitbox: { ox: 44, oy: 16, w: 40, h: 20 }, chain: true },
  kick:       { startup: 0.13, active: 0.07, recovery: 0.24, dmg: 7,  hitstun: 0.28, blockstun: 0.15, knockback: 110, hitbox: { ox: 48, oy: 46, w: 44, h: 20 }, chain: true },
  heavyPunch: { startup: 0.26, active: 0.09, recovery: 0.42, dmg: 16, hitstun: 0.45, blockstun: 0.22, knockback: 300, knockdown: true, hitbox: { ox: 55, oy: 12, w: 55, h: 28 } },
  heavyKick:  { startup: 0.30, active: 0.10, recovery: 0.48, dmg: 18, hitstun: 0.50, blockstun: 0.24, knockback: 350, launch: 440,     hitbox: { ox: 55, oy: 36, w: 56, h: 32 } },
  air:        { startup: 0.10, active: 0.12, recovery: 0.15, dmg: 9,  hitstun: 0.30, blockstun: 0.15, knockback: 150, hitbox: { ox: 40, oy: 50, w: 44, h: 30 } },
};
