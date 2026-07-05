// Biggest tank in the roster: slow, heavy reach, huge damage — even
// slower and heavier-hitting than Kratos, at the cost of long recovery.
export default {
  punch:      { startup: 0.11, active: 0.06, recovery: 0.21, dmg: 6,  hitstun: 0.26, blockstun: 0.14, knockback: 95,  hitbox: { ox: 44, oy: 16, w: 40, h: 20 }, chain: true },
  kick:       { startup: 0.14, active: 0.07, recovery: 0.25, dmg: 7,  hitstun: 0.28, blockstun: 0.15, knockback: 115, hitbox: { ox: 48, oy: 46, w: 44, h: 20 }, chain: true },
  heavyPunch: { startup: 0.27, active: 0.09, recovery: 0.43, dmg: 15, hitstun: 0.45, blockstun: 0.22, knockback: 300, knockdown: true, hitbox: { ox: 52, oy: 12, w: 52, h: 28 } },
  heavyKick:  { startup: 0.31, active: 0.10, recovery: 0.49, dmg: 17, hitstun: 0.50, blockstun: 0.24, knockback: 340, launch: 420,     hitbox: { ox: 54, oy: 36, w: 54, h: 32 } },
  air:        { startup: 0.11, active: 0.12, recovery: 0.16, dmg: 8,  hitstun: 0.30, blockstun: 0.15, knockback: 145, hitbox: { ox: 38, oy: 50, w: 42, h: 28 } },
};
